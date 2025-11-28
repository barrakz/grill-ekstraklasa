#!/bin/bash

# Kolory dla outputu
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔍 Symulacja procesu deploymentu na serwer produkcyjny  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Krok 1: Linting
echo -e "${YELLOW}📋 Krok 1/4: ESLint - sprawdzanie jakości kodu...${NC}"
npm run lint
if [ $? -ne 0 ]; then
    echo -e "\n${RED}❌ Linting failed!${NC}"
    echo -e "${RED}Napraw błędy ESLint przed deploymentem.${NC}"
    echo -e "${YELLOW}Wskazówka: Uruchom 'npm run lint' aby zobaczyć szczegóły.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Linting passed${NC}\n"

# Krok 2: TypeScript type checking
echo -e "${YELLOW}📋 Krok 2/4: TypeScript - sprawdzanie typów...${NC}"
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo -e "\n${RED}❌ TypeScript errors found!${NC}"
    echo -e "${RED}Napraw błędy typów przed deploymentem.${NC}"
    echo -e "${YELLOW}Wskazówka: Uruchom 'npx tsc --noEmit' aby zobaczyć szczegóły.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ TypeScript check passed${NC}\n"

# Krok 3: Usunięcie poprzedniego buildu (jak na serwerze)
echo -e "${YELLOW}📋 Krok 3/4: Czyszczenie cache buildu...${NC}"
rm -rf .next
echo -e "${GREEN}✅ Build cache cleared${NC}\n"

# Krok 4: Production build (dokładnie jak na serwerze)
echo -e "${YELLOW}📋 Krok 4/4: Production build (npm run build)...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "\n${RED}❌ Build failed!${NC}"
    echo -e "${RED}Sprawdź błędy powyżej.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}\n"

# Sukces!
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🎉 Wszystkie testy przeszły pomyślnie!                   ║${NC}"
echo -e "${GREEN}║  ✨ Kod jest gotowy do deploymentu na serwer.             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
