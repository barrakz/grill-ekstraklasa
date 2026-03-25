from collections import defaultdict
from datetime import datetime
from zoneinfo import ZoneInfo

from django.db import transaction
from django.db.models import Avg, Count, Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from clubs.models import Club
from players.models import Player

from .models import ClubAlias, Fixture, FixturePlayer, PlayerAlias, Round, Season
from .utils import normalize_text, similarity


def infer_season_name(match_date):
    year = match_date.year
    if match_date.month >= 7:
        return f"{year}/{year + 1}"
    return f"{year - 1}/{year}"


def parse_kickoff(date_value, time_value, timezone_name="Europe/Warsaw"):
    if not date_value or not time_value:
        raise ValidationError("Każdy mecz musi mieć pola `date` i `time`.")

    try:
        local_dt = datetime.strptime(f"{date_value} {time_value}", "%Y-%m-%d %H:%M")
    except ValueError as exc:
        raise ValidationError("Nieprawidłowy format daty lub godziny.") from exc

    tzinfo = ZoneInfo(timezone_name)
    return timezone.make_aware(local_dt, tzinfo)


def map_fixture_status(raw_status):
    normalized = normalize_text(raw_status)
    if normalized in {"finished", "full time", "completed"}:
        return Fixture.STATUS_FINISHED
    if normalized in {"live", "in play"}:
        return Fixture.STATUS_LIVE
    if normalized in {"published"}:
        return Fixture.STATUS_PUBLISHED
    if normalized in {"archived"}:
        return Fixture.STATUS_ARCHIVED
    return Fixture.STATUS_LINEUP_PENDING


def _club_candidate_payload(club, score=0.0, method="candidate"):
    return {
        "id": club.id,
        "name": club.name,
        "score": round(score, 3),
        "method": method,
    }


def match_club_name(raw_name, club_scope=None):
    clubs = list((club_scope or Club.objects.exclude(name="Loan")).order_by("name"))
    aliases = list(ClubAlias.objects.select_related("club").filter(club__in=clubs))
    normalized_raw = normalize_text(raw_name)
    if not normalized_raw:
        return {
            "club": None,
            "confidence": "low",
            "method": "empty",
            "candidates": [],
        }

    for club in clubs:
        if club.name.lower() == raw_name.lower():
            return {
                "club": club,
                "confidence": "high",
                "method": "exact_name",
                "candidates": [_club_candidate_payload(club, 1, "exact_name")],
            }

    normalized_index = {normalize_text(club.name): club for club in clubs}
    if normalized_raw in normalized_index:
        club = normalized_index[normalized_raw]
        return {
            "club": club,
            "confidence": "high",
            "method": "normalized_name",
            "candidates": [_club_candidate_payload(club, 1, "normalized_name")],
        }

    for alias in aliases:
        if alias.normalized_alias == normalized_raw:
            return {
                "club": alias.club,
                "confidence": "high",
                "method": "club_alias",
                "candidates": [_club_candidate_payload(alias.club, 1, "club_alias")],
            }

    prefix_matches = []
    for club in clubs:
        normalized_name = normalize_text(club.name)
        if normalized_name.startswith(normalized_raw) or normalized_raw.startswith(normalized_name):
            prefix_matches.append((club, 0.9, "prefix"))

    if len(prefix_matches) == 1:
        club, score, method = prefix_matches[0]
        return {
            "club": club,
            "confidence": "medium",
            "method": method,
            "candidates": [_club_candidate_payload(club, score, method)],
        }

    ranked = []
    for club in clubs:
        ranked.append((similarity(raw_name, club.name), club, "fuzzy_name"))
    for alias in aliases:
        ranked.append((similarity(raw_name, alias.alias), alias.club, "fuzzy_alias"))

    deduped = {}
    for score, club, method in sorted(ranked, key=lambda item: item[0], reverse=True):
        existing = deduped.get(club.id)
        if existing is None or score > existing[0]:
            deduped[club.id] = (score, club, method)

    candidates = [
        _club_candidate_payload(club, score, method)
        for score, club, method in sorted(deduped.values(), key=lambda item: item[0], reverse=True)[:5]
        if score >= 0.55
    ]

    if candidates and candidates[0]["score"] >= 0.88:
        club = next(club for club in clubs if club.id == candidates[0]["id"])
        return {
            "club": club,
            "confidence": "medium",
            "method": candidates[0]["method"],
            "candidates": candidates,
        }

    return {
        "club": None,
        "confidence": "low",
        "method": "unmatched",
        "candidates": candidates,
    }


def _player_payload(player, score=0.0, method="candidate"):
    return {
        "id": player.id,
        "name": player.name,
        "position": player.position,
        "club_id": player.club_id,
        "score": round(score, 3),
        "method": method,
    }


def _surname_forms(player_name):
    tokens = normalize_text(player_name).split()
    if not tokens:
        return set(), set(), ""

    primary_surnames = set()
    if len(tokens) > 1:
        primary_surnames.add(" ".join(tokens[1:]))
        primary_surnames.add(tokens[-1])
    primary_surnames.add(tokens[0])

    initials = {tokens[0][:1]}
    if len(tokens) > 1:
        initials.add(tokens[-1][:1])

    return primary_surnames, initials, normalize_text(player_name)


def match_player_name(raw_name, club):
    players = list(Player.objects.filter(club=club).order_by("name"))
    aliases = list(PlayerAlias.objects.select_related("player").filter(club=club, player__in=players))
    normalized_raw = normalize_text(raw_name)

    if not normalized_raw:
        return {
            "player": None,
            "confidence": "low",
            "method": "empty",
            "status": "not_found",
            "candidates": [],
        }

    for alias in aliases:
        if alias.normalized_alias == normalized_raw:
            return {
                "player": alias.player,
                "confidence": "high",
                "method": "player_alias",
                "status": "matched",
                "candidates": [_player_payload(alias.player, 1, "player_alias")],
            }

    normalized_index = {}
    for player in players:
        normalized_index[normalize_text(player.name)] = player
        if player.name.lower() == raw_name.lower():
            return {
                "player": player,
                "confidence": "high",
                "method": "exact_name",
                "status": "matched",
                "candidates": [_player_payload(player, 1, "exact_name")],
            }

    if normalized_raw in normalized_index:
        player = normalized_index[normalized_raw]
        return {
            "player": player,
            "confidence": "high",
            "method": "normalized_name",
            "status": "matched",
            "candidates": [_player_payload(player, 1, "normalized_name")],
        }

    raw_tokens = normalized_raw.split()
    surname_matches = []
    if len(raw_tokens) >= 2 and len(raw_tokens[-1]) == 1:
        raw_surname = " ".join(raw_tokens[:-1])
        raw_initial = raw_tokens[-1]
        for player in players:
            surnames, initials, _ = _surname_forms(player.name)
            if raw_initial in initials and raw_surname in surnames:
                surname_matches.append(player)

    if len(surname_matches) == 1:
        player = surname_matches[0]
        return {
            "player": player,
            "confidence": "high",
            "method": "surname_initial",
            "status": "matched",
            "candidates": [_player_payload(player, 0.95, "surname_initial")],
        }
    if surname_matches:
        player = surname_matches[0]
        return {
            "player": player,
            "confidence": "medium",
            "method": "surname_initial_multiple",
            "status": "needs_review",
            "candidates": [_player_payload(candidate, 0.8, "surname_initial") for candidate in surname_matches[:5]],
        }

    ranked = []
    for player in players:
        ranked.append((similarity(raw_name, player.name), player, "fuzzy_name"))
    for alias in aliases:
        ranked.append((similarity(raw_name, alias.alias), alias.player, "fuzzy_alias"))

    deduped = {}
    for score, player, method in sorted(ranked, key=lambda item: item[0], reverse=True):
        existing = deduped.get(player.id)
        if existing is None or score > existing[0]:
            deduped[player.id] = (score, player, method)

    candidates = [
        _player_payload(player, score, method)
        for score, player, method in sorted(deduped.values(), key=lambda item: item[0], reverse=True)[:5]
        if score >= 0.55
    ]

    if candidates and candidates[0]["score"] >= 0.9:
        player = next(player for player in players if player.id == candidates[0]["id"])
        return {
            "player": player,
            "confidence": "medium",
            "method": candidates[0]["method"],
            "status": "needs_review",
            "candidates": candidates,
        }
    if candidates and candidates[0]["score"] >= 0.74:
        player = next(player for player in players if player.id == candidates[0]["id"])
        return {
            "player": player,
            "confidence": "low",
            "method": candidates[0]["method"],
            "status": "needs_review",
            "candidates": candidates,
        }

    return {
        "player": None,
        "confidence": "low",
        "method": "not_found",
        "status": "not_found",
        "candidates": candidates,
    }


def _fixture_import_rows(payload):
    if isinstance(payload, dict) and isinstance(payload.get("matches"), list):
        return payload["matches"]
    if isinstance(payload, list):
        return payload
    raise ValidationError("Payload importu meczów musi zawierać tablicę `matches`.")


def analyze_fixture_import(payload, default_timezone="Europe/Warsaw", default_season_name=None):
    rows = _fixture_import_rows(payload)
    entries = []

    for index, row in enumerate(rows):
        raw_home = row.get("home_team", "")
        raw_away = row.get("away_team", "")
        home_match = match_club_name(raw_home)
        away_match = match_club_name(raw_away)

        errors = []
        kickoff_at = None
        try:
            kickoff_at = parse_kickoff(
                row.get("date"),
                row.get("time"),
                row.get("timezone") or default_timezone,
            )
        except ValidationError as exc:
            errors.append(str(exc.detail[0] if isinstance(exc.detail, list) else exc.detail))

        status = "new"
        action = "create"
        existing_fixture = None

        if home_match["club"] and away_match["club"] and kickoff_at:
            existing_fixture = Fixture.objects.filter(
                home_club=home_match["club"],
                away_club=away_match["club"],
                kickoff_at=kickoff_at,
            ).first()

            if existing_fixture:
                status = "duplicate"
                action = "skip"
            else:
                similar_fixture = Fixture.objects.filter(
                    home_club=home_match["club"],
                    away_club=away_match["club"],
                    kickoff_at__date=kickoff_at.date(),
                ).order_by("kickoff_at").first()
                if similar_fixture:
                    status = "update"
                    action = "update"
                    existing_fixture = similar_fixture

        if home_match["club"] is None or away_match["club"] is None:
            status = "unmatched_club"
            action = "skip"

        season_name = row.get("season") or default_season_name
        if not season_name and kickoff_at:
            season_name = infer_season_name(timezone.localtime(kickoff_at).date())

        entries.append(
            {
                "import_key": f"fixture-{index}",
                "status": status,
                "action": action,
                "errors": errors,
                "existing_fixture_id": existing_fixture.id if existing_fixture else None,
                "home_team_input": raw_home,
                "away_team_input": raw_away,
                "home_club": None
                if not home_match["club"]
                else {"id": home_match["club"].id, "name": home_match["club"].name},
                "away_club": None
                if not away_match["club"]
                else {"id": away_match["club"].id, "name": away_match["club"].name},
                "home_candidates": home_match["candidates"],
                "away_candidates": away_match["candidates"],
                "home_match_method": home_match["method"],
                "away_match_method": away_match["method"],
                "kickoff_at": kickoff_at.isoformat() if kickoff_at else None,
                "round_number": row.get("round"),
                "season_name": season_name,
                "status_value": map_fixture_status(row.get("status")),
                "source_name": row.get("source", ""),
                "source_url": row.get("source_url", ""),
                "raw": row,
            }
        )

    return {"entries": entries}


def _ensure_season_and_round(season_name, round_number, kickoff_at):
    season, _ = Season.objects.get_or_create(name=season_name)
    round_instance = None
    if round_number:
        round_instance, _ = Round.objects.get_or_create(season=season, number=round_number)
        if kickoff_at:
            if round_instance.starts_at is None or kickoff_at < round_instance.starts_at:
                round_instance.starts_at = kickoff_at
            if round_instance.ends_at is None or kickoff_at > round_instance.ends_at:
                round_instance.ends_at = kickoff_at
            round_instance.save(update_fields=["starts_at", "ends_at"])
    return season, round_instance


def attach_full_squad(fixture, overwrite=False):
    if overwrite:
        FixturePlayer.objects.filter(fixture=fixture).delete()

    existing_player_ids = set(
        FixturePlayer.objects.filter(fixture=fixture, player__isnull=False).values_list("player_id", flat=True)
    )

    order = {
        "GK": 0,
        "DF": 1,
        "MF": 2,
        "FW": 3,
    }

    for side, club in (
        (FixturePlayer.SIDE_HOME, fixture.home_club),
        (FixturePlayer.SIDE_AWAY, fixture.away_club),
    ):
        club_players = list(Player.objects.filter(club=club).order_by("name"))
        club_players.sort(key=lambda player: (order.get(player.position, 9), player.name))
        offset = 0 if side == FixturePlayer.SIDE_HOME else 1000
        for index, player in enumerate(club_players):
            if player.id in existing_player_ids:
                continue
            FixturePlayer.objects.create(
                fixture=fixture,
                player=player,
                club=club,
                side=side,
                selection_status=FixturePlayer.STATUS_PREDICTED,
                source_type=FixturePlayer.SOURCE_AUTO_FULL_SQUAD,
                source_confidence="high",
                sort_order=offset + index,
                is_visible_public=False,
                raw_name=player.name,
            )


@transaction.atomic
def confirm_fixture_import(entries, attach_full_squads_enabled=False):
    created_ids = []
    updated_ids = []

    for entry in entries:
        action = entry.get("action")
        if action not in {"create", "update"}:
            continue

        home_club_id = entry.get("home_club_id") or (entry.get("home_club") or {}).get("id")
        away_club_id = entry.get("away_club_id") or (entry.get("away_club") or {}).get("id")
        kickoff_raw = entry.get("kickoff_at")
        season_name = entry.get("season_name")

        if not home_club_id or not away_club_id or not kickoff_raw or not season_name:
            raise ValidationError("Każdy potwierdzany mecz musi mieć kluby, kickoff_at i season_name.")

        home_club = Club.objects.get(pk=home_club_id)
        away_club = Club.objects.get(pk=away_club_id)
        kickoff_at = datetime.fromisoformat(kickoff_raw)
        if timezone.is_naive(kickoff_at):
            kickoff_at = timezone.make_aware(kickoff_at, timezone.get_current_timezone())

        season, round_instance = _ensure_season_and_round(
            season_name,
            entry.get("round_number"),
            kickoff_at,
        )

        fixture = None
        existing_fixture_id = entry.get("existing_fixture_id")
        if action == "update" and existing_fixture_id:
            fixture = Fixture.objects.filter(pk=existing_fixture_id).first()

        if fixture is None:
            fixture, created = Fixture.objects.get_or_create(
                home_club=home_club,
                away_club=away_club,
                kickoff_at=kickoff_at,
                defaults={
                    "season": season,
                    "round": round_instance,
                    "status": entry.get("status_value") or Fixture.STATUS_LINEUP_PENDING,
                    "source_name": entry.get("source_name", ""),
                    "source_url": entry.get("source_url", ""),
                    "import_payload": entry.get("raw") or entry,
                },
            )
            if created:
                created_ids.append(fixture.id)
            else:
                updated_ids.append(fixture.id)
        else:
            fixture.home_club = home_club
            fixture.away_club = away_club
            fixture.kickoff_at = kickoff_at
            fixture.season = season
            fixture.round = round_instance
            fixture.status = entry.get("status_value") or fixture.status
            fixture.source_name = entry.get("source_name", "")
            fixture.source_url = entry.get("source_url", "")
            fixture.import_payload = entry.get("raw") or entry
            fixture.save()
            updated_ids.append(fixture.id)

        if entry.get("home_team_input") and normalize_text(entry["home_team_input"]) != normalize_text(home_club.name):
            if not ClubAlias.objects.filter(club=home_club, normalized_alias=normalize_text(entry["home_team_input"])).exists():
                ClubAlias.objects.create(club=home_club, alias=entry["home_team_input"], source="fixture_import")
        if entry.get("away_team_input") and normalize_text(entry["away_team_input"]) != normalize_text(away_club.name):
            if not ClubAlias.objects.filter(club=away_club, normalized_alias=normalize_text(entry["away_team_input"])).exists():
                ClubAlias.objects.create(club=away_club, alias=entry["away_team_input"], source="fixture_import")

        if attach_full_squads_enabled:
            attach_full_squad(fixture)

    return {
        "created_ids": created_ids,
        "updated_ids": updated_ids,
    }


def _lineup_entries(payload):
    if not isinstance(payload, dict):
        raise ValidationError("Payload importu składu musi być obiektem JSON.")

    teams = payload.get("teams")
    if not isinstance(teams, dict):
        raise ValidationError("Payload importu składu musi zawierać obiekt `teams`.")
    return teams


def analyze_lineup_import(fixture, payload):
    teams_payload = _lineup_entries(payload)
    available_clubs = Club.objects.filter(pk__in=[fixture.home_club_id, fixture.away_club_id])

    side_mapping = {}
    for raw_team_name in teams_payload.keys():
        club_match = match_club_name(raw_team_name, available_clubs)
        matched_club = club_match["club"]
        if matched_club is None:
            continue
        if matched_club.id == fixture.home_club_id:
            side_mapping[raw_team_name] = FixturePlayer.SIDE_HOME
        elif matched_club.id == fixture.away_club_id:
            side_mapping[raw_team_name] = FixturePlayer.SIDE_AWAY

    entries = []
    available_players = defaultdict(list)
    for side, club in (
        (FixturePlayer.SIDE_HOME, fixture.home_club),
        (FixturePlayer.SIDE_AWAY, fixture.away_club),
    ):
        for player in Player.objects.filter(club=club).order_by("name"):
            available_players[side].append(
                {
                    "id": player.id,
                    "name": player.name,
                    "position": player.position,
                }
            )

    for raw_team_name, team_payload in teams_payload.items():
        side = side_mapping.get(raw_team_name)
        if side is None:
            continue
        club = fixture.home_club if side == FixturePlayer.SIDE_HOME else fixture.away_club
        sections = (
            ("starting_lineup", FixturePlayer.STATUS_STARTING_XI),
            ("substitutes", FixturePlayer.STATUS_BENCH),
        )
        for section_name, selection_status in sections:
            for index, item in enumerate(team_payload.get(section_name, [])):
                raw_name = item.get("name", "")
                match = match_player_name(raw_name, club)
                player = match["player"]
                entries.append(
                    {
                        "entry_key": f"{side}-{selection_status}-{index}",
                        "side": side,
                        "club_id": club.id,
                        "club_name": club.name,
                        "selection_status": selection_status,
                        "raw_name": raw_name,
                        "shirt_number": item.get("number"),
                        "position": item.get("position", ""),
                        "captain": bool(item.get("captain")),
                        "player_id": player.id if player else None,
                        "player_name": player.name if player else None,
                        "confidence": match["confidence"],
                        "method": match["method"],
                        "status": match["status"],
                        "candidates": match["candidates"],
                    }
                )

    return {
        "fixture": {
            "id": fixture.id,
            "slug": fixture.slug,
            "home_club_name": fixture.home_club.name,
            "away_club_name": fixture.away_club.name,
            "kickoff_at": fixture.kickoff_at.isoformat(),
        },
        "available_players": dict(available_players),
        "entries": entries,
        "unmapped_teams": [team_name for team_name in teams_payload.keys() if team_name not in side_mapping],
    }


@transaction.atomic
def confirm_lineup_import(fixture, entries, raw_payload=None):
    FixturePlayer.objects.filter(fixture=fixture).delete()

    created = []
    grouped_sort_order = {
        FixturePlayer.SIDE_HOME: 0,
        FixturePlayer.SIDE_AWAY: 1000,
    }

    for index, entry in enumerate(entries):
        side = entry.get("side")
        if side not in {FixturePlayer.SIDE_HOME, FixturePlayer.SIDE_AWAY}:
            raise ValidationError("Nieprawidłowa wartość `side` w imporcie składu.")

        club = fixture.home_club if side == FixturePlayer.SIDE_HOME else fixture.away_club
        player = None
        player_id = entry.get("player_id")
        if player_id:
            player = Player.objects.filter(pk=player_id, club=club).first()
            if player is None:
                raise ValidationError("Wybrany piłkarz nie należy do odpowiedniego klubu.")

        fixture_player = FixturePlayer.objects.create(
            fixture=fixture,
            player=player,
            club=club,
            side=side,
            selection_status=entry.get("selection_status") or FixturePlayer.STATUS_BENCH,
            source_type=FixturePlayer.SOURCE_PASTE_IMPORT,
            source_confidence=entry.get("confidence", ""),
            sort_order=grouped_sort_order[side] + index,
            shirt_number=entry.get("shirt_number"),
            is_visible_public=True,
            raw_name=entry.get("raw_name", ""),
            position_label=entry.get("position", ""),
            is_captain=bool(entry.get("captain")),
        )
        created.append(fixture_player.id)

        raw_name = entry.get("raw_name", "")
        if player and raw_name and normalize_text(raw_name) != normalize_text(player.name):
            normalized_alias = normalize_text(raw_name)
            if not PlayerAlias.objects.filter(player=player, club=club, normalized_alias=normalized_alias).exists():
                PlayerAlias.objects.create(
                    player=player,
                    club=club,
                    alias=raw_name,
                    source="lineup_import",
                )

    fixture.lineup_payload = raw_payload
    fixture.lineup_confirmed_at = timezone.now()
    if fixture.status in {Fixture.STATUS_DRAFT, Fixture.STATUS_LINEUP_PENDING}:
        fixture.status = Fixture.STATUS_PUBLISHED
        fixture.published_at = fixture.published_at or timezone.now()
    fixture.save(update_fields=["lineup_payload", "lineup_confirmed_at", "status", "published_at"])

    return {"created_fixture_player_ids": created}


def fixture_queryset_with_counts():
    return Fixture.objects.select_related("season", "round", "home_club", "away_club").annotate(
        players_count=Count("fixture_players", distinct=True),
        ratings_total=Count("ratings", distinct=True),
        home_players_count=Count(
            "fixture_players",
            filter=Q(fixture_players__side=FixturePlayer.SIDE_HOME),
            distinct=True,
        ),
        away_players_count=Count(
            "fixture_players",
            filter=Q(fixture_players__side=FixturePlayer.SIDE_AWAY),
            distinct=True,
        ),
    )


def _position_rank(position_label, player_position=None):
    raw_value = position_label or player_position or ""
    normalized = normalize_text(raw_value)
    if normalized in {"gk", "br", "bramkarz", "goalkeeper"}:
        return 0
    if normalized in {"df", "def", "ob", "obronca", "defender"}:
        return 1
    if normalized in {"mf", "mid", "pom", "pomocnik", "midfielder"}:
        return 2
    if normalized in {"fw", "fwd", "st", "nap", "napastnik", "forward", "striker"}:
        return 3
    return 9


def _selection_rank(selection_status):
    order = {
        FixturePlayer.STATUS_STARTING_XI: 0,
        FixturePlayer.STATUS_BENCH: 1,
        FixturePlayer.STATUS_PLAYED: 2,
        FixturePlayer.STATUS_PREDICTED: 3,
        FixturePlayer.STATUS_UNUSED: 4,
        FixturePlayer.STATUS_HIDDEN: 5,
    }
    return order.get(selection_status, 9)


def current_lineup_summary(fixture, public_only=False, include_rating_summary=False):
    grouped = defaultdict(list)
    queryset = FixturePlayer.objects.filter(fixture=fixture).select_related("player", "club")
    if public_only:
        queryset = queryset.filter(is_visible_public=True)
    if include_rating_summary:
        queryset = queryset.annotate(
            rating_avg=Avg("ratings__value"),
            ratings_count=Count("ratings"),
        )
    queryset = queryset.order_by("side", "sort_order", "id")

    for item in queryset:
        sort_key = (
            _position_rank(item.position_label, item.player.position if item.player else ""),
            _selection_rank(item.selection_status),
            item.sort_order,
            item.id,
        )
        payload = {
            "id": item.id,
            "player_id": item.player_id,
            "player_name": item.player.name if item.player else None,
            "raw_name": item.raw_name,
            "club_name": item.club.name,
            "selection_status": item.selection_status,
            "shirt_number": item.shirt_number,
            "position": item.position_label,
            "captain": item.is_captain,
        }
        if include_rating_summary:
            payload["rating_avg"] = round(item.rating_avg or 0, 2)
            payload["ratings_count"] = item.ratings_count or 0
        grouped[item.side].append((sort_key, payload))

    ordered = {}
    for side, entries in grouped.items():
        ordered[side] = [payload for _, payload in sorted(entries, key=lambda item: item[0])]
    return ordered


def apply_manual_lineup(fixture, payload):
    if not isinstance(payload, dict):
        raise ValidationError("Payload składu musi być obiektem JSON.")

    def normalize_side(side_key):
        if side_key not in {"home", "away"}:
            raise ValidationError("Payload składu musi mieć klucze 'home' i 'away'.")
        side_payload = payload.get(side_key)
        if not isinstance(side_payload, dict):
            raise ValidationError("Każda strona składu musi być obiektem JSON.")
        starting = side_payload.get("starting", [])
        bench = side_payload.get("bench", [])
        if not isinstance(starting, list) or not isinstance(bench, list):
            raise ValidationError("Listy 'starting' i 'bench' muszą być tablicami ID.")
        try:
            starting_ids = [int(value) for value in starting]
            bench_ids = [int(value) for value in bench]
        except (TypeError, ValueError):
            raise ValidationError("ID zawodników muszą być liczbami całkowitymi.")
        if len(set(starting_ids + bench_ids)) != len(starting_ids + bench_ids):
            raise ValidationError("Ten sam zawodnik nie może być w dwóch sekcjach.")
        return starting_ids, bench_ids

    home_starting, home_bench = normalize_side("home")
    away_starting, away_bench = normalize_side("away")

    def validate_players(player_ids, club, label):
        if not player_ids:
            return {}
        players = list(Player.objects.filter(id__in=player_ids, club=club))
        if len(players) != len(set(player_ids)):
            raise ValidationError(f"Nieprawidłowe ID zawodników w sekcji {label}.")
        return {player.id: player for player in players}

    home_players = validate_players(home_starting + home_bench, fixture.home_club, "home")
    away_players = validate_players(away_starting + away_bench, fixture.away_club, "away")

    all_selected_ids = set(home_players.keys()) | set(away_players.keys())

    grouped_sort_order = {
        FixturePlayer.SIDE_HOME: 0,
        FixturePlayer.SIDE_AWAY: 1000,
    }

    def upsert_side(side, club, starting_ids, bench_ids, player_map):
        order = grouped_sort_order[side]
        for player_id in starting_ids:
            player = player_map[player_id]
            fixture_player, _ = FixturePlayer.objects.get_or_create(
                fixture=fixture,
                player=player,
                defaults={
                    "club": club,
                    "side": side,
                },
            )
            fixture_player.club = club
            fixture_player.side = side
            fixture_player.selection_status = FixturePlayer.STATUS_STARTING_XI
            fixture_player.source_type = FixturePlayer.SOURCE_MANUAL
            fixture_player.source_confidence = "manual_edit"
            fixture_player.sort_order = order
            fixture_player.is_visible_public = True
            fixture_player.raw_name = player.name
            fixture_player.position_label = player.position
            fixture_player.save()
            order += 1

        for player_id in bench_ids:
            player = player_map[player_id]
            fixture_player, _ = FixturePlayer.objects.get_or_create(
                fixture=fixture,
                player=player,
                defaults={
                    "club": club,
                    "side": side,
                },
            )
            fixture_player.club = club
            fixture_player.side = side
            fixture_player.selection_status = FixturePlayer.STATUS_BENCH
            fixture_player.source_type = FixturePlayer.SOURCE_MANUAL
            fixture_player.source_confidence = "manual_edit"
            fixture_player.sort_order = order
            fixture_player.is_visible_public = True
            fixture_player.raw_name = player.name
            fixture_player.position_label = player.position
            fixture_player.save()
            order += 1

    upsert_side(FixturePlayer.SIDE_HOME, fixture.home_club, home_starting, home_bench, home_players)
    upsert_side(FixturePlayer.SIDE_AWAY, fixture.away_club, away_starting, away_bench, away_players)

    FixturePlayer.objects.filter(fixture=fixture).exclude(player_id__in=all_selected_ids).update(
        is_visible_public=False,
        selection_status=FixturePlayer.STATUS_HIDDEN,
    )

    fixture.lineup_confirmed_at = timezone.now()
    if fixture.status in {Fixture.STATUS_DRAFT, Fixture.STATUS_LINEUP_PENDING}:
        fixture.status = Fixture.STATUS_PUBLISHED
        fixture.published_at = fixture.published_at or timezone.now()
    fixture.save(update_fields=["lineup_confirmed_at", "status", "published_at"])
    return fixture
