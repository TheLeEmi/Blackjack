# Blackjack
Documentație Tehnică și Manual de Utilizare: Aplicația Web "Casino Royal"

1. Descrierea Proiectului
Proiectul "Casino Royal" reprezintă o aplicație web dezvoltată pentru a simula un mediu virtual de cazinou. Aplicația integrează un motor logic pentru jocul de Blackjack (cu suport pentru modurile Singleplayer și Multiplayer Local), un modul educațional dedicat exersării tehnicii de numărare a cărților (sistemul Hi-Lo), un sistem de ierarhizare a jucătorilor și un panou de administrare.

2. Arhitectură și Tehnologii Utilizate
Aplicația este implementată exclusiv pe partea de client (Front-End), având la bază următoarele tehnologii și concepte tehnice:
•	Framework de bază: React.js, configurat prin intermediul bundler-ului Vite pentru optimizarea timpilor de compilare și a modulelor.
•	Managementul Stării (State Management): S-au utilizat intens funcțiile de tip Hook (useState, useEffect) pentru gestionarea stărilor asincrone, a sesiunilor utilizatorilor și a ciclului de viață al componentelor (ex: logica de turn-based a jocului).
•	Persistența Datelor: Interfața localStorage (Web Storage API) este utilizată pentru a simula o bază de date non-relațională. Aceasta asigură persistența sesiunilor de utilizator, a balanței financiare virtuale și a metricilor de performanță între sesiuni.
•	Stilizare (UI/UX): Implementare CSS nativă, utilizând tehnici moderne de layout (Flexbox, CSS Grid) și design responsiv (Media Queries). Interfața adoptă elemente de tip "Glassmorphism" și utilizează animații CSS (Keyframes) pentru a oferi o experiență fluidă.


3. Instrucțiuni de Instalare și Rulare a Proiectului
Pentru evaluarea și testarea aplicației în mediul local, sunt necesari următorii pași:
Cerințe de sistem: Mediul de execuție Node.js instalat pe stația de lucru.
1.	Se navighează din terminal în directorul rădăcină al proiectului (locația fișierului package.json).
2.	Se execută comanda npm install pentru a descărca și instala dependențele specificate.
3.	Se inițializează serverul local de dezvoltare rulând comanda npm run dev.
4.	Aplicația va fi accesibilă în browserul web la adresa returnată de consolă (implicit: http://localhost:5173).
Resetarea stării aplicației: Pentru a goli baza de date simulată (ștergerea tuturor utilizatorilor), se accesează uneltele pentru dezvoltatori din browser (DevTools -> secțiunea Application -> Local Storage), se șterge intrarea corespunzătoare cheii blackjackUsers, după care se reîncarcă pagina.

4. Descrierea Modulelor Funcționale
Aplicația este structurată în cinci componente logice principale:
A. Modulul de Autentificare și Sesiuni (Login/Signup)
•	Permite crearea de conturi noi și autentificarea utilizatorilor existenți. La crearea unui profil nou, sistemul alocă automat un fond virtual inițial de $1000.
•	Notă de evaluare: Crearea unui cont utilizând credențialul admin (username) acordă automat privilegii de administrator în cadrul aplicației.
•	Deoarece momentan aplicația nu utilizează o bază de date, în momentul loginului nu se verifică parola
B. Modulul de Joc (Masa de Blackjack)
•	Lobby și Configurare: Utilizatorul poate selecta modul Singleplayer sau modul Multiplayer Local (Hotseat), permițând adăugarea a până la 3 jucători suplimentari la aceeași masă.
•	Mecanica de joc: Implementează un sistem turn-based. Fiecare entitate plasează un pariu individual, urmat de deciziile standard ("Hit" pentru a solicita o carte suplimentară, "Stand" pentru a ceda rândul). Logica validează automat stările de Bust (depășirea sumei de 21).
•	Automatizarea Dealerului: Odată ce toți jucătorii își încheie rândul, dealerul acționează bazat pe un algoritm predefinit (trage cărți până atinge scorul minim de 17), urmat de calculul automat al câștigurilor și actualizarea stării financiare a fiecărui profil.
C. Modulul Educațional (Card Counting)
•	Implementează un exercițiu interactiv de evaluare a concentrării, bazat pe sistemul real Hi-Lo.
•	Aplicația randează secvențial o serie de cărți de joc la un interval de timp prestabilit (ajustabil de utilizator). Jucătorul trebuie să introducă valoarea matematică finală (True Count). Scorul obținut actualizează metrica de acuratețe din baza de date.
D. Modulul de Profil și Analiză (Leaderboard)
•	Profilul Individual: Un dashboard care afișează performanțele agregate (Rata de câștig procentuală, Acuratețea la numărătoare), permițând totodată modificarea numelui de utilizator și injectarea de fonduri virtuale suplimentare.
•	Clasament Global (Leaderboard): Un tabel ordonabil ce compară performanțele tuturor entităților înregistrate în sistem. Oferă opțiuni de sortare în funcție de victorii sau precizie matematică.
E. Modulul de Administrare (Admin Dashboard)
•	Interfață cu acces restricționat, destinată gestionării sistemului.
•	Afișează agregate statistice de ansamblu (număr de utilizatori, fonduri totale).
•	Oferă instrumente de moderare a bazei de date: suspendarea/reactivarea conturilor (Ban/Unban), penalizarea financiară prin resetarea balanței și gestionarea permisiunilor (Promovare la Administrator).

