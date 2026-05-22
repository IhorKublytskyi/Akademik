# Scenariusze testów manualnych — Akademik

**Środowisko:** http://localhost, Chrome 147.0.7727.102 (64-bit), Windows 11 Pro  
**Aplikacja:** `docker compose up -d`

| Rola | Login | Hasło |
|------|-------|-------|
| Administrator | admin@akademik.com | admin123 |
| Mieszkaniec | ivan@student.com | student123 |

---

## WEB-TC-001 — Logowanie z poprawnymi danymi

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Formularz logowania |
| **Typ testu** | Pozytywny |
| **Dane testowe** | admin@akademik.com / admin123 |
| **Warunki wstępne** | Konto istnieje; użytkownik niezalogowany |
| **Kroki** | 1. Otwórz /login · 2. Wpisz email · 3. Wpisz hasło · 4. Kliknij „Zaloguj się" |
| **Oczekiwany rezultat** | Przekierowanie na /dashboard; nazwa użytkownika widoczna w nagłówku |
| **Rzeczywisty rezultat** | Przekierowanie na /dashboard nastąpiło. W nagłówku widoczna nazwa „Administrator". |
| **Wynik testu** | ☑ Pass |

---

## WEB-TC-002 — Logowanie z błędnym hasłem

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Formularz logowania |
| **Typ testu** | Negatywny |
| **Dane testowe** | admin@akademik.com / zlehaslo999 |
| **Warunki wstępne** | Konto istnieje; użytkownik niezalogowany |
| **Kroki** | 1. Otwórz /login · 2. Wpisz email · 3. Wpisz błędne hasło · 4. Kliknij „Zaloguj się" |
| **Oczekiwany rezultat** | Brak przekierowania; komunikat o błędnych danych |
| **Rzeczywisty rezultat** | Strona pozostała na /login. Wyświetlono komunikat „Nieprawidłowy login lub hasło". |
| **Wynik testu** | ☑ Pass |

---

## WEB-TC-003 — Dodanie nowego użytkownika przez administratora

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Panel administratora — użytkownicy |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Imię: Jan, Nazwisko: Testowy, Email: jan.testowy@akademik.com |
| **Warunki wstępne** | Zalogowany jako administrator |
| **Kroki** | 1. Przejdź do /dashboard/users · 2. Kliknij „Dodaj użytkownika" · 3. Wypełnij formularz · 4. Kliknij „Zapisz" |
| **Oczekiwany rezultat** | Nowy użytkownik widoczny na liście |
| **Rzeczywisty rezultat** | Użytkownik Jan Testowy pojawił się na liście. Wyświetlono komunikat potwierdzający. |
| **Wynik testu** | ☑ Pass |

---

## WEB-TC-004 — Zgłoszenie usterki przez mieszkańca

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Zgłoszenia usterek |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Tytuł: „Awaria ogrzewania", Priorytet: Wysoki; konto: ivan@student.com |
| **Warunki wstępne** | Zalogowany jako mieszkaniec |
| **Kroki** | 1. Przejdź do /dashboard/issues · 2. Kliknij „Nowe zgłoszenie" · 3. Wypełnij formularz · 4. Kliknij „Wyślij" |
| **Oczekiwany rezultat** | Usterka zapisana ze statusem NEW; widoczna na liście |
| **Rzeczywisty rezultat** | Usterka „Awaria ogrzewania" pojawiła się na liście ze statusem NEW. |
| **Wynik testu** | ☑ Pass |

---

## WEB-TC-005 — Zmiana statusu usterki przez administratora

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Panel administratora — usterki |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Usterka ze statusem NEW (z WEB-TC-004) |
| **Warunki wstępne** | Zalogowany jako administrator; usterka ze statusem NEW istnieje |
| **Kroki** | 1. Przejdź do /dashboard/issues · 2. Otwórz usterkę · 3. Zmień status na „IN_PROGRESS" · 4. Zapisz |
| **Oczekiwany rezultat** | Status zmieniony na IN_PROGRESS; mieszkaniec otrzymuje powiadomienie |
| **Rzeczywisty rezultat** | Status usterki zmieniony na IN_PROGRESS. Powiadomienie wysłane do ivan@student.com. |
| **Wynik testu** | ☑ Pass |

---

## WEB-TC-006 — Złożenie skargi przez mieszkańca

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Formularz skargi |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Treść: „Hałas w nocy z pokoju 205"; konto: ivan@student.com |
| **Warunki wstępne** | Zalogowany jako mieszkaniec |
| **Kroki** | 1. Przejdź do /dashboard/complaints · 2. Kliknij „Nowa skarga" · 3. Wpisz treść · 4. Kliknij „Wyślij" |
| **Oczekiwany rezultat** | Skarga zapisana ze statusem NEW |
| **Rzeczywisty rezultat** | Skarga pojawiła się na liście ze statusem NEW. Toast „Skarga zarejestrowana" wyświetlony. |
| **Wynik testu** | ☑ Pass |

---

## WEB-TC-007 — Złożenie anonimowej skargi

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Formularz skargi — tryb anonimowy |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Treść: „Problem z windą"; opcja „Anonimowo" zaznaczona |
| **Warunki wstępne** | Zalogowany jako mieszkaniec |
| **Kroki** | 1. Przejdź do /dashboard/complaints · 2. Kliknij „Nowa skarga" · 3. Wpisz treść · 4. Zaznacz „Anonimowo" · 5. Kliknij „Wyślij" |
| **Oczekiwany rezultat** | Skarga zapisana bez przypisanego użytkownika |
| **Rzeczywisty rezultat** | Skarga zapisana. W panelu admina pole „Autor" puste — anonimowość zachowana. |
| **Wynik testu** | ☑ Pass |

---

## WEB-TC-008 — Generowanie kodu QR przez mieszkańca

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Moduł kodów QR |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Konto: ivan@student.com |
| **Warunki wstępne** | Zalogowany jako mieszkaniec |
| **Kroki** | 1. Przejdź do /dashboard/qr · 2. Kliknij „Wygeneruj kod QR" · 3. Sprawdź wyświetlony kod i datę ważności |
| **Oczekiwany rezultat** | Kod QR wyświetlony; status ACTIVE; data ważności widoczna |
| **Rzeczywisty rezultat** | Kod QR wyświetlony. Status ACTIVE. Data ważności: +24h od generacji. |
| **Wynik testu** | ☑ Pass |

---

## WEB-TC-009 — Unieważnienie kodu QR przez administratora

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Panel administratora — kody QR |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Aktywny kod QR mieszkańca (z WEB-TC-008) |
| **Warunki wstępne** | Zalogowany jako administrator; istnieje kod QR ze statusem ACTIVE |
| **Kroki** | 1. Otwórz panel QR (admin) · 2. Znajdź kod QR mieszkańca · 3. Kliknij „Unieważnij" · 4. Potwierdź |
| **Oczekiwany rezultat** | Status kodu zmieniony na REVOKED |
| **Rzeczywisty rezultat** | Status zmieniony na REVOKED. Kod nie może być ponownie użyty. |
| **Wynik testu** | ☑ Pass |

---

## WEB-TC-010 — Przypisanie mieszkańca do pokoju

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Panel administratora — przypisania |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Użytkownik: Jan Testowy (z WEB-TC-003), Pokój: 101 |
| **Warunki wstępne** | Zalogowany jako administrator; pokój 101 ma wolne miejsca |
| **Kroki** | 1. Przejdź do /dashboard/assignments · 2. Kliknij „Dodaj" · 3. Wybierz użytkownika i pokój · 4. Zapisz |
| **Oczekiwany rezultat** | Przypisanie widoczne na liście |
| **Rzeczywisty rezultat** | Przypisanie Jan Testowy → Pokój 101 widoczne na liście. |
| **Wynik testu** | ☑ Pass |

---

## WEB-TC-011 — Dodanie wydarzenia osobistego przez mieszkańca

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Kalendarz — wydarzenia osobiste |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Tytuł: „Spotkanie z dziekanem", jutro 10:00–11:00; konto: ivan@student.com |
| **Warunki wstępne** | Zalogowany jako mieszkaniec |
| **Kroki** | 1. Przejdź do /dashboard/events · 2. Kliknij „Dodaj wydarzenie" · 3. Wypełnij tytuł i czas · 4. Zapisz |
| **Oczekiwany rezultat** | Wydarzenie widoczne w kalendarzu w wybranym terminie |
| **Rzeczywisty rezultat** | Wydarzenie „Spotkanie z dziekanem" widoczne w kalendarzu na wybraną datę. |
| **Wynik testu** | ☑ Pass |

---

## WEB-TC-012 — Masowe tworzenie inspekcji pokojów przez administratora

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Panel administratora — inspekcje |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Data inspekcji: przyszły tydzień, wszystkie pokoje |
| **Warunki wstępne** | Zalogowany jako administrator; pokoje istnieją w systemie |
| **Kroki** | 1. Przejdź do /dashboard/events · 2. Kliknij „Utwórz inspekcje" · 3. Wybierz datę i pokoje · 4. Kliknij „Generuj" |
| **Oczekiwany rezultat** | Eventy inspekcji widoczne w kalendarzu; mieszkańcy otrzymują powiadomienia |
| **Rzeczywisty rezultat** | Inspekcje utworzone dla wszystkich pokojów. Widoczne w kalendarzu. Powiadomienia wysłane. |
| **Wynik testu** | ☑ Pass |

---

## Raport z testów

| ID | Scenariusz | Typ | Wynik | Status |
|----|-----------|-----|-------|--------|
| WEB-TC-001 | Logowanie z poprawnymi danymi | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-002 | Logowanie z błędnym hasłem | Negatywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-003 | Dodanie użytkownika przez admina | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-004 | Zgłoszenie usterki | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-005 | Zmiana statusu usterki | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-006 | Złożenie skargi | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-007 | Anonimowa skarga | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-008 | Generowanie kodu QR | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-009 | Unieważnienie kodu QR | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-010 | Przypisanie mieszkańca do pokoju | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-011 | Dodanie wydarzenia osobistego | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-012 | Masowe inspekcje pokojów | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |

**Środowisko:** http://localhost · Chrome 147 · Windows 11 Pro  
**Łącznie:** 12 testów · 12 Pass · 0 Fail  
**Pokrycie user flow:** ~100% (logowanie, użytkownicy, pokoje, usterki, skargi, QR, wydarzenia)
