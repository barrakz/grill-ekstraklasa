from django.urls import path

from .views import (
    AdminAttachFullSquadsView,
    AdminFixtureDetailView,
    AdminFixtureImportAnalyzeView,
    AdminFixtureImportConfirmView,
    AdminFixtureLineupUpdateView,
    AdminFixtureListView,
    AdminLineupImportAnalyzeView,
    AdminLineupImportConfirmView,
    FixtureDetailView,
    FixtureListView,
    FixtureRatingView,
    FixtureUpcomingView,
)


urlpatterns = [
    path("fixtures/", FixtureListView.as_view(), name="fixture-list"),
    path("fixtures/upcoming/", FixtureUpcomingView.as_view(), name="fixture-upcoming"),
    path("fixtures/<slug:slug>/", FixtureDetailView.as_view(), name="fixture-detail"),
    path("fixtures/<slug:slug>/ratings/", FixtureRatingView.as_view(), name="fixture-rating"),
    path("admin/fixtures/", AdminFixtureListView.as_view(), name="admin-fixture-list"),
    path("admin/fixtures/import/analyze/", AdminFixtureImportAnalyzeView.as_view(), name="admin-fixture-import-analyze"),
    path("admin/fixtures/import/confirm/", AdminFixtureImportConfirmView.as_view(), name="admin-fixture-import-confirm"),
    path("admin/fixtures/<int:fixture_id>/", AdminFixtureDetailView.as_view(), name="admin-fixture-detail"),
    path("admin/fixtures/<int:fixture_id>/lineup/", AdminFixtureLineupUpdateView.as_view(), name="admin-fixture-lineup-update"),
    path(
        "admin/fixtures/<int:fixture_id>/attach-full-squads/",
        AdminAttachFullSquadsView.as_view(),
        name="admin-fixture-attach-full-squads",
    ),
    path(
        "admin/fixtures/<int:fixture_id>/lineup-import/analyze/",
        AdminLineupImportAnalyzeView.as_view(),
        name="admin-lineup-import-analyze",
    ),
    path(
        "admin/fixtures/<int:fixture_id>/lineup-import/confirm/",
        AdminLineupImportConfirmView.as_view(),
        name="admin-lineup-import-confirm",
    ),
]
