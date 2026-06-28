const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'database.json');

// Helper to generate salt and hash password
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return { salt, hash };
}

// Default rules data to seed the database
const defaultRules = {
  "general": {
    "title": "Regulament General",
    "chapters": [
      {
        "id": "cap-gen-1",
        "title": "Capitolul 1: Definiții și Concepte de Bază",
        "subchapters": [
          {
            "id": "sub-gen-1-1",
            "title": "1.1 Ce este Roleplay-ul (RP)?",
            "content": "Roleplay-ul reprezintă simularea unei vieți reale în cadrul jocului, unde îți asumi rolul unui personaj fictiv cu propria personalitate, istoric și scopuri. Toate acțiunile tale trebuie să fie realiste și plauzibile."
          },
          {
            "id": "sub-gen-1-2",
            "title": "1.2 MetaGaming (MG)",
            "content": "MetaGaming-ul reprezintă folosirea informațiilor primite în afara jocului (OOC - Out of Character) pentru a obține un avantaj în interiorul jocului (IC - In Character). Exemple: folosirea chat-ului Discord sau vizionarea unui stream pentru a afla locația unui jucător."
          },
          {
            "id": "sub-gen-1-3",
            "title": "1.3 PowerGaming (PG)",
            "content": "PowerGaming-ul reprezintă efectuarea unor acțiuni supranaturale, imposibile în viața reală, sau impunerea voinței tale asupra altui jucător fără a-i oferi o șansă de a reacționa. Exemple: conducerea unei mașini sport pe munte fără drum, sau scrierea în chat-ul local că ai legat o persoană fără ca aceasta să fie de acord sau să aibă posibilitatea de a se elibera."
          }
        ]
      },
      {
        "id": "cap-gen-2",
        "title": "Capitolul 2: Conduită și Comportament",
        "subchapters": [
          {
            "id": "sub-gen-2-1",
            "title": "2.1 Comportamentul Out of Character (OOC)",
            "content": "Orice formă de toxicitate, jigniri sau amenințări în afara caracterului (pe chat-ul OOC, Discord sau PM-uri) este strict interzisă. Respectul reciproc între jucători este obligatoriu, indiferent de conflictele dintre caracterele din joc."
          },
          {
            "id": "sub-gen-2-2",
            "title": "2.2 Refuzul de a face Roleplay",
            "content": "Ieșirea din joc în timpul unei acțiuni active (Combat Log), refuzul de a vorbi cu un alt jucător într-o situație RP sau ignorarea intenționată a acțiunilor celorlalți jucători se pedepsește cu suspendarea contului."
          }
        ]
      }
    ]
  },
  "sanctiuni": {
    "title": "Lista Sancțiuni",
    "chapters": [
      {
        "id": "cap-sanc-1",
        "title": "Capitolul 1: Încălcări de Regulament (Check Points)",
        "subchapters": [
          {
            "id": "sub-sanc-1-1",
            "title": "1.1 Tabel Sancțiuni Active & Puncte de Penalizare",
            "content": "• Aroganțe la ticket - 75 Check Points\n• Fake Mafia - 25 Check Points / Înmulțit cu câți membri au fost implicați\n• Armă în zona publică – 100 Check Points + 1 Warn (În funcție de gravitate)\n• BUG ABUZ – 100 Check Points + 1 Warn (În funcție de gravitate)\n• Car Ram – 100 Check Points\n• Car Surf – 70 Check Points\n• Cererea a mai mult de 50.000 pe un ostatic – 30 Check Points\n• Comportament de Bombardier - 100 Check Points + 1 Warn (În funcție de gravitate)\n• Cop Bait – 200 Check Points\n• Cop Fear – 200 Check Points + 1 Warn (În funcție de gravitate)\n• Deranjare event – se consideră troll\n• Deranjare Ticket – 30 Check Points\n• Deschidere OOC în IC – 70 Check Points + 1 Warn (În funcție de gravitate)\n• Disconnect în roleplay - 200 Check Points\n• Disconnect la ticket - 100 Check Points\n• Fail Roleplay – 150 Check Points + 1 Warn (În funcție de gravitate)\n• Fake Cop – 75 Check Points + 1 Warn (În funcție de gravitate)\n• Ilegalități în zona publică - 100 Check Points + 1 Warn (În funcție de gravitate)\n• Ticket Inutil - 30 Check Points (DOAR DACĂ SE FACE TICKET REPETITIV DE LA ACEEAȘI PERSOANĂ)\n• Jigniri OOC – 150 Check Points + 1 Warn (În funcție de gravitate)\n• Meta-Gaming – 150 Check Points + 1 Warn (În funcție de gravitate)\n• Minciuni la ticket – 30 Check Points\n• Necooperare cu un membru staff – 40 Check Points\n• Nerespectare PK – 100 Check Points\n• Ninja Jack – 75 Check Points\n• Non-Fear Roleplay – 200 Check Points + 1 Warn (În funcție de gravitate)\n• Pit Stop – 50 Check Points\n• Post hunt – 75 Check Points\n• Power-Gaming – 150 Check Points + 1 Warn (În funcție de gravitate)\n• Provoking – 40 Check Points\n• Random Deathmatch – 200 Check Points + 1 Warn (În funcție de gravitate)\n• Refuz Roleplay – 75 Check Points\n• Condus Non RolePlay – 50 Check Points\n• Revenge Kill – 200 Check Points\n• Rob and Kill / Kill and Rob / Drop and Kill – 150 Check Points\n• Roleplay Scârbos - 200 Check Points + 1 Warn (În funcție de gravitate)\n• Sfidare staff / Încuri staff - 70 Check Points\n• Suferințe - 40 Check Points\n• Ticket în roleplay – 30 Check Points\n• Troll - 300 Check Points\n• Ținerea unui ostatic mai mult de 60 minute – 50 Check Points\n• Vehicle Deathmatch – 200 Check Points + 1 Warn (În funcție de gravitate)\n• Moduri interzise (prima abatere se iartă) - 30 Check Points\n• Scam - 70 Check Points + 1 Warn (În funcție de gravitate)\n• Ilegalități sub 75 ore - 50 Check Points\n• Abuz de third - 50 Check Points\n• Stream Snipe - 100 Check Points + 1 Warn (În funcție de gravitate)\n• Lipsă filmare la RP - 75 Check Points\n• DEL nejustificat - 30 Check Points\n• Fake ostatic - 50 Check Points\n• Alianță cu civili - 100 Check Points"
          }
        ]
      },
      {
        "id": "cap-sanc-2",
        "title": "Capitolul 2: Sancțiuni Chat (Mute)",
        "subchapters": [
          {
            "id": "sub-sanc-2-1",
            "title": "2.1 Limite și Durate Mute",
            "content": "• Mixing – 30 minute mute chat\n• Limbaj Vulgar – 30 minute mute chat\n• Free chat – 30 minute mute chat\n• Înjurături server – 100 minute mute chat"
          }
        ]
      },
      {
        "id": "cap-sanc-3",
        "title": "Capitolul 3: Măsuri Administrative Corecționale (Kick & Ban)",
        "subchapters": [
          {
            "id": "sub-sanc-3-1",
            "title": "3.1 Situații de Kick (Afară de pe server)",
            "content": "• Microfon non-funcțional (după ce încercați să-l ajutați să rezolve problema)\n• Ped buguit (după ce încercați să-l ajutați să rezolve problema)\n• Nume interzis (prima abatere kick, apoi ban între 1-3 zile)\n• AFK în afara zonei de la Primărie"
          },
          {
            "id": "sub-sanc-3-2",
            "title": "3.2 Ban Permanent",
            "content": "• HACK – Ban Permanent (Drept de plată: DA)"
          }
        ]
      },
      {
        "id": "cap-sanc-4",
        "title": "Capitolul 4: Ghid Aplicare Sancțiuni",
        "subchapters": [
          {
            "id": "sub-sanc-4-1",
            "title": "4.1 Mențiuni Importante (De reținut)",
            "content": "Rămâne la decizia adminului dacă va acorda sancțiunea sau un simplu warn / iertare verbală, cu EXCEPȚIA următoarelor sancțiuni grave unde aplicarea este obligatorie:\n- HACK\n- TROLL"
          }
        ]
      }
    ]
  },
  "pd": {
    "title": "Regulament Poliție",
    "chapters": [
      {
        "id": "cap-pd-1",
        "title": "Capitolul 1: Diviziile și Gradele Poliției",
        "subchapters": [
          {
            "id": "sub-pd-1-1",
            "title": "1.1 Diviziile Poliției",
            "content": "TRUPA ANTI TERO (TAT) - Această divizie are ca atribuţii executarea misiunilor cu grad ridicat de risc, atunci când celelalte structuri de poliție sunt limitate ca și capabilități logistice sau tactice.\n\nBRIGADA RUTIERA (SR) - Această divizie are ca atribuţii menținerea siguranței și ordinii pe drumurile publice. Principalele atribuții includ monitorizarea traficului, sancționarea încălcărilor legislației rutiere, gestionarea accidentelor și fluidizarea circulației.\n\nORDINE PUBLICA (OP) - Această divizie are ca atribuţii de a menține liniștea și siguranța cetățenilor. Agenții patrulează în zonele publice, intervin la sesizări și conflicte, previn și combat faptele antisociale, verifică persoanele suspecte și asigură respectarea legii. Scopul principal este menținerea unui climat de ordine și protejarea orasului."
          },
          {
            "id": "sub-pd-1-2",
            "title": "1.2 Corpuri și Grade Profesionale",
            "content": "Categoriile de poliţişti se împart pe corpuri şi grade profesionale, după cum urmează:\n\nI. Corpul ofițerilor de poliție:\n- Chestor General\n- Chestor Sef\n- Chestor Principal\n- Chestor\n- Comisar Sef\n- Comisar\n- Subcomisar\n- Inspector Principal\n- Inspector\n- Subinspector\n\nII. Corpul subofițerilor de poliție:\n- Agent Șef Principal\n- Agent Sef\n- Agent Sef Adjunct\n- Agent Principal\n- Agent\n- Cadet\n\nGradele profesionale de Chestor, Chestor Principal si Chestor Sef pot fi obţinute numai de către ofiţeri cu vechime, implicare și la decizia Chestorului General și Chestorilor Sef."
          }
        ]
      },
      {
        "id": "cap-pd-2",
        "title": "Capitolul 2: Regulament General, Activitate și Grade",
        "subchapters": [
          {
            "id": "sub-pd-2-1",
            "title": "2.1 Reguli Generale",
            "content": "Sunteți obligați să respectați întocmai regulamentul de mai jos, alături de regulamentul serverului.\n\nNu aveți voie să folosiți vehiculele personale cât și alte vehicule dacă nu sunt cele de poliție dacă sunteți ON-DUTY.\n\nEste interzisă folosirea mașinilor nemarcate în cazul în care nu faceți parte din TAT.\n\nPăstrați un limbaj decent, evitați să vorbiți vulgar sau să fiți toxici cu persoanele, nu aveți voie să ridicați tonul (doar dacă situația impune) sau să jigniți."
          },
          {
            "id": "sub-pd-2-2",
            "title": "2.2 Activitate și Pontaj",
            "content": "Activitatea voastră trebuie să fie constantă, membrii care nu intră pe server în decursul a 5 zile fără o cerere de inactivitate, vor fi demiși automat din facțiune.\n\nNu aveți voie să fentați pontajul prin orice metode.\n\nPontajul se resetează în fiecare duminică la ora comunicată de Chestorul General.\n\nPersoanele care au o scutire activă nu au cum să primească rank-up."
          },
          {
            "id": "sub-pd-2-3",
            "title": "2.3 Rank-Up și Avansare",
            "content": "Rank-up se primește doar la ședința de duminică.\n\nÎn cazul în care aveți Faction Warn activ nu puteți avansa în funcție. Faction Warn-ul expiră după 7 zile."
          }
        ]
      },
      {
        "id": "cap-pd-3",
        "title": "Capitolul 3: Stația Radio și Sancțiuni",
        "subchapters": [
          {
            "id": "sub-pd-3-1",
            "title": "3.1 Reguli Stație",
            "content": "Când sunteți on-duty aveți obligația de a sta în permanență pe stație.\n\nDacă sunteți off-duty NU aveți voie să fiți pe stație.\n\nFolosiți stația doar pentru lucruri importante, fără free chat.\n\nStații active:\n- STAȚIA 1: Stația generală TAT/Jafuri/Alte acțiuni\n- STAȚIA 2: Stația generală a poliției\n\nNu intrați pe stație dacă sunteți morți."
          },
          {
            "id": "sub-pd-3-2",
            "title": "3.2 Sancțiuni și Avertismente",
            "content": "Sancțiunile se dau în funcție de gravitate. Orice grad din conducere vă poate sancționa așa cum consideră de cuviință.\n\nFaction Warn-ul expiră la 7 zile de la primire.\n\nAV-urile expiră la 7 zile de la primire, la 2 AV-uri primite primiți automat Faction Warn.\n\nSancțiunile pot fi date și IC și OOC de către LIDER/CO-LIDER.\n\nDacă primiți o sancțiune de la un admin în timp ce sunteți on-duty la poliție, acest lucru poate aduce sancțiuni interne în cazul în care influențează roleplay-ul poliției."
          }
        ]
      },
      {
        "id": "cap-pd-4",
        "title": "Capitolul 4: Regulament Intern și Proceduri",
        "subchapters": [
          {
            "id": "sub-pd-4-1",
            "title": "4.1 Corupția",
            "content": "Este strict interzisă orice formă de corupție, atât IC cât și OOC.\nEste strict interzisă desfășurarea oricărei activități ilegale.\nEste strict interzisă divulgarea informațiilor din interiorul departamentului de poliție.\nEste strict interzisă vânzarea sau înmânarea armamentului și/sau echipamentului din dotare altor persoane.\n\nExemple de corupție / activități ilegale:\n- Acceptarea unei sume de bani în schimbul scutirii inculpatului de o sentință\n- Eliberarea de bună voie a unor infractori / ascunderea infractorilor\n- Oferirea / ascunderea echipamentului din dotare\n- Vânzarea / folosirea echipamentului din dotare în scopuri personale\n- Jefuirea persoanelor, a afacerilor ori practicarea unor joburi ilegale"
          },
          {
            "id": "sub-pd-4-2",
            "title": "4.2 Patrule, Urmăriri și Manevra PIT-STOP",
            "content": "Nu aveți voie să patrulați cu mai mult de 150km/h (decât în cazul în care sunteți într-o urmărire).\n\nPe stație într-o urmărire trebuie anunțate următoarele informații: marca mașinii, modelul, culoarea, numerele de înmatriculare și locația unde se deplasează.\n\nÎn cazul unei urmăriri este strict interzis să se intre în plin în mașina suspectului pentru a-l opri, se poate cere permisiunea unui AGENT ȘEF PRINCIPAL+ pentru a efectua manevra PIT-STOP.\n\nEste strict interzisă efectuați manevra de PIT-STOP la o viteză mai mare de 150km/h. Această manevră poate fi efectuată cu orice autovehicul din dotarea poliției. Manevra se face cu scopul de a opri autovehiculul prin lovirea aripii spate a mașinii cu aripa față a autospecialei. Puteți face PIT-STOP doar cu o mașină care deține bullbar.\n\nÎntr-o urmărire nu aveți voie să trageți la roți dacă nu a trecut cel puțin 1 minut.\n\nDacă observați că suspectul se îndreaptă într-o zonă rău famată (roșie) unde se poate crea o ambuscadă se poate trage la roți imediat sau misiunea se poate opri pentru a nu vă pierde viața.\n\nEste interzisă intrarea frontală într-un autovehicul pentru a-l opri. Esre obligatorie păstrarea distanței de către organele de poliție pentru a evita posibile coliziuni.\n\nPoliția are voie să patruleze și să controleze zonele rău famate în care se livrează droguri la orice oră, cu condiția să fie minim 2.\n\nEste interzisă mutarea autospecialei după ce a fost deja poziționată pentru realizarea blocajului.\n\nCadeții nu au voie să patruleze singuri, trebuie să aibă un Agent+ cu ei. Este interzisă patrula mixtă (Agent + TAT).\n\nEste interzisă blocarea tuturor benzilor unei autostrăzi. Blocajul se face doar pe o singură bandă sau în formă de „Z”, cu echipaje dispuse la distanțe mari."
          },
          {
            "id": "sub-pd-4-3",
            "title": "4.3 Preluare Apeluri și Conduită",
            "content": "Polițistul este obligat să solicite intervenția unui grad superior dacă acest lucru este cerut în cadrul celulelor.\n\nCetățenii trebuie tratați cu respect, menținând o conduită corectă, dar fermă, chiar și în situațiile în care devin recalcitranți.\n\nPolițistul trebuie să aibă asupra sa legitimația și să se identifice la orice interacțiune cu cetățenii sau ori de câte ori îi este solicitat.\n\nPolițistul trebuie să se comporte exemplar în trafic și să ofere un model de conduită rutieră.\n\nEste strict interzis ca un polițist să preia apeluri în timp ce este OFF-DUTY. Nu aveți voie să mergeți la apeluri fără o formulare roleplay. Aveți voie să mergeți la apeluri false și să sancționați conform codului penal (ex: 'Cineva vinde cauciucuri'). Nu aveți voie să vă prezentați singuri la apel."
          },
          {
            "id": "sub-pd-4-4",
            "title": "4.4 Vehicule de Poliție",
            "content": "Sunteți obligați să respectați mașina gradului/diviziei.\n\nNu aveți voie să schimbați culorile mașinilor de poliție, să puneți neoane, geamuri fumurii sau alt claxon."
          },
          {
            "id": "sub-pd-4-5",
            "title": "4.5 Protocolul Traffic-Stop",
            "content": "1. Autospeciala se poziționează mereu în spatele mașinii urmărite cu botul la 45 de grade spre stradă.\n2. Pasagerul se va da jos din autospecială pentru a-l identifica pe suspect.\n3. Șoferul autospecialei are atribuția de a conduce.\n4. Pasagerul are atribuția de a informa colegii pe stație, de a oferi locația actuală a patrulei etc.\n5. Se va declina calitatea și îi veți explica motivul pentru care a fost oprit.\n6. Tazer-ul poate fi ținut în mână pentru siguranța polițistului și pentru a nu încerca să fuga.\n7. Dacă încearcă să fugă, colegul de la volan este pregătit pentru urmărire.\n8. Dacă colegii tăi sunt atacați într-o altă zonă și tu ești în manevra de traffic-stop, ești obligat să renunți la orice acțiune și să îți ajuți colegii."
          },
          {
            "id": "sub-pd-4-6",
            "title": "4.6 Reguli Percheziții",
            "content": "Vă este strict interzis să percheziționați o persoană dacă nu are una dintre următoarele suspiciuni:\n- O mască pe față\n- O vestă antiglonț\n- O cască antiglonț\n- Un comportament neadecvat față de civil sau de organul de poliție\n- O bandană la picior\n- Se află într-o zonă rău famată\n\nNotă: În cazul în care persoana în cauză se află pe un motor și are o mască de orice tip / cască și nu prezintă alte suspiciuni, nu este nevoie să îl trageți pe dreapta / să îi faceți percheziții.\n\nPercheziția este permisă și în condițiile în care:\n- Se află într-o zonă în care s-au tras focuri de armă.\n- Autovehiculul său nu are plăcuțe de înmatriculare.\n- Este văzut cu o armă asupra sa.\n- Deține un mandat activ.\n- Se află într-o zonă Rău Famată și este surprins umblând din casă în casă, sărind garduri, bătând la ușa unei locuințe (activități specifice zonelor \"Rău Famate\").\n- După încheierea unei urmăriri auto sau când a fost încătușat.\n- Ca răspuns la un apel de urgență în care este raportat ca fiind înarmat sau în posesia unor obiecte ilegale (arme, droguri, etc.) sau a comis fapte ilegale grave (crimă, jaf, etc.). (Este obligatorie o dovadă video pentru a putea interveni).\n- Persoana poate fi percheziționată și în locul în care a fost încătușată, dar dacă situația nu permite, poate fi transportată la secție.\n- Persoanele care pătrund în interiorul Secției de Poliție fără acordul unui organ competent trebuie percheziționate."
          },
          {
            "id": "sub-pd-4-7",
            "title": "4.7 Protocolul în Celule",
            "content": "Sentința maximă pe care o poate acorda un polițist sub gradul de ASP este de 180 de luni.\n\nCa agent în cadrul poliției, nu aveți dreptul să vorbiți urât cu persoanele arestate sau să le bateți (excepție TAT).\n\nCelulele trebuie încuiate de fiecare dată când aveți un infractor în interior."
          },
          {
            "id": "sub-pd-4-8",
            "title": "4.8 Razii și Mandate",
            "content": "Poliția are voie să patruleze și să controleze zonele rău famate în care se produc droguri decât cu un mandat sau în cadrul unei razii. Poliția are voie să controleze insula Cayo Perico doar în timpul raziei. La razii, respectați în permanență ordinele coordonatorilor.\n\nPoliția nu are voie să acționeze pe o proprietate privată fără a deține un mandat pe acea locație. În cazul focurilor de armă, poliția nu are voie să intre într-o locație fără un mandat. În schimb, este permisă intrarea într-o proprietate privată doar în cazul în care timpul de emitere al unui mandat ar duce la pierderea unei vieți (ex: în curtea casei se află persoane înarmate care țintesc civili, sau în interiorul casei o persoană este ținută captivă).\n\nMandatele pe locații se pot face doar către un CHESTOR GENERAL."
          },
          {
            "id": "sub-pd-4-9",
            "title": "4.9 Protocoale Jafuri",
            "content": "BANCA PACIFIC:\n- La acest jaf se regăsesc oostatici, scopul vostru este să vă asigurați că scapă cu viață.\n- La o negociere la jaf trebuie să verificați înainte starea ostaticilor (în viață, răniți etc.) și să negociați pe baza asta. Nu au voie să ceară cale liberă dacă nu au un ostatic.\n- Minimul de polițiști pentru acest jaf este 8.\n- Suma maximă care se poate cere pentru un ostatic este de $50.000. Mafioții nu au voie să vă ceară altceva în afară de bani.\n- Nu aveți voie să negociați multe lucruri în favoarea mafioților.\n- Sunteți obligați să veniți cu maxim 6 insurgenți. La acest jaf, 3 insurgenți trebuie puși la intrarea secundară sub formă de blocaj (BOX).\n- Mafioții nu au voie să tragă în elicopterul poliției, iar poliția nu are voie să tragă în cel al mafioților.\n- Elicopterul este doar pentru informații și aterizare de urgență.\n- Trusele se pot da după terminarea jafului dacă nu sunt medici pe server sau nu răspund în termen de 5 minute.\n- Dacă ai murit la jaf, NU MAI AI VOIE SĂ TE ÎNTORCI.\n\nMAGAZINUL DE BIJUTERII VANGELICO:\n- Aici nu sunt permiși ostaticii, deci se pornește direct cu foc deschis.\n- Minimul de polițiști este 6. Aveți voie cu maxim 4 insurgenți.\n- Regulile pentru elicopter, truse medicale și neîntoarcere după moarte rămân identice ca la Pacific.\n\nJAFURI MAGAZINE:\n- Pot exista ostatici. Dacă există, trebuie salvați cu viață. Negocierile se fac similar.\n- Minimul de polițiști este 3. Suma maximă per ostatic este de $50.000.\n- La jaful de magazine aveți voie cu 2 insurgenți.\n- Trusele medicale se dau după terminarea jafului dacă nu sunt medici online de 5 minute. Nu vă întoarceți la jaf dacă muriți."
          },
          {
            "id": "sub-pd-4-10",
            "title": "4.10 Transporturi Specifice",
            "content": "La transporturi se va deplasa poliția cu mașina aferentă unității.\n\nLa transporturi se va deplasa echipajul T.A.T cu mașina nemarcată.\n\nSe va soma înainte ca focul să fie deschis.\n\nMinimul de polițiști care se vor deplasa la transport este de 6."
          },
          {
            "id": "sub-pd-4-11",
            "title": "4.11 Utilizarea MDT-ului și a Taserului",
            "content": "MDT (Mobile Data Terminal):\n- Dăruirea de informații din MDT unui membru care nu face parte din poliție este strict INTERZISĂ.\n- Notițele scrise 'la mișto' sau pentru amuzament sunt interzise.\n- Modificarea amenzilor sau sentințelor de pe MDT este strict interzisă.\n- Puteți să folosiți MDT-ul doar dacă dețineți certificatul MDT care vă atestă cunoștințele.\n\nTASER (Stun Gun):\n- Se folosește dacă suspectul încearcă să fugă cu mașina după ce a fost somat să rămână pe loc.\n- Dacă suspectul fuge pe jos după ce a coborât dintr-un vehicul urmărit.\n- Dacă nu se respectă indicațiile ofițerului.\n- Dacă suspectul este pe o motocicletă în timpul unei urmăriri și are o viteză sub 50 km/h (doar cu aprobarea unui INSPECTOR+).\n\nCând NU ai voie să tragi cu taserul:\n- Cetățeanul se află în apă (risc electrocutare).\n- Cetățeanul se află la o înălțime mare (poduri, marginea unei clădiri, scări, lângă prăpastie) unde există risc de cădere mortală.\n- Când suspectul este înarmat cu o armă letală (este obligatoriu să răspundeți tot cu o armă letală)."
          },
          {
            "id": "sub-pd-4-12",
            "title": "4.12 Organizarea Convoiului",
            "content": "Deținuții sunt obligați să fie escortați în autobuzul Penitenciarului.\n\nSunteți obligați ca în momentul în care sunt identificate minim 4 persoane ale unei grupări infracționale să îi transportați la închisoarea de maximă siguranță printr-un convoi.\n\nConvoiul este obligatoriu să fie realizat indiferent că din toți cei prinși rămâne doar unul în viață / la secție.\n\nLa un convoi, numărul maxim de insurgenți este 6, iar numărul maxim de elicoptere este 2.\n\nVă este strict interzis să trimiteți un echipaj înaintea convoiului pentru a campa/asigura zona.\n\nVă este permis să mergeți cu elicopterul în față în momentul în care convoiul ajunge la despărțirea de pe autostradă după casa Fluenta Blanca.\n\nSchimbarea rutei pentru autobuz este strict interzisă. Autobuzul trebuie să urmeze ruta desemnată oficial din imaginea tactică.\n\n*(Pentru harta detaliată a traseului oficial, consultați imaginea de mai jos)*\n\n<div style=\"text-align: center; margin: 1.5rem 0;\"><img src=\"assets/convoi.png\" alt=\"Harta Traseu Oficial Convoi\" style=\"max-width: 100%; border-radius: 8px; border: 1px solid var(--primary-glow); box-shadow: var(--shadow-neon);\"></div>"
          },
          {
            "id": "sub-pd-4-13",
            "title": "4.13 Programul On-Duty / Off-Duty",
            "content": "Este interzisă folosirea mașinilor din dotare când sunteți OFF-DUTY.\nEste interzisă folosirea echipamentului și armamentului când sunteți OFF-DUTY.\nEste interzisă folosirea uniformei când sunteți OFF-DUTY.\n\nProgramul obligatoriu ON-DUTY este de la ora 08:00 până la 01:00. Numărul persoanelor ON-DUTY va fi în funcție de câți polițiști sunt online. Această prezență asigură asistență constantă pe timp de noapte și de zi.\n\nDacă sunteți OFF-DUTY și intervine un jaf la banca Pacific sau un mandat important, sunteți OBLIGAȚI să vă întoarceți la datorie și să participați la intervenție."
          },
          {
            "id": "sub-pd-4-14",
            "title": "4.14 Reguli OOC (Out of Character)",
            "content": "Este interzisă blocarea căilor de acces la jafuri.\n\nAveți voie să păstrați obiectele ilegale dobândite cât timp nu ați fost în poliție, atât timp cât le depozitați înaintea intrării în departament, într-un loc pe care NU îl accesați în timpul șederii în departament.\n\nEste interzis să deschideți focul asupra unei persoane fără un motiv justificat.\n\nÎn momentul în care ieșiți din departament trebuie să 'uitați' (să NU folosiți IC) informațiile interne din departament, procedurile și departamentele din care făceau parte colegii (de ex. DIICOT). Puteți ține minte colegii cu care v-ați împrietenit, însă nu și rolul lor din poliție.\n\nÎn cazul în care un jucător încalcă regulamentul, soluționați problema cu ajutorul membrilor STAFF. NU încălcați și voi regulamentul ca răspuns (de ex. în urmăriri)."
          }
        ]
      },
      {
        "id": "cap-pd-5",
        "title": "Capitolul 5: Legislație Rutieră",
        "subchapters": [
          {
            "id": "sub-pd-5-1",
            "title": "5.1 Limitele de Viteză și Sancțiuni",
            "content": "Orice cetățean are obligația de a respecta limitele de viteză rutiere:\n- Pe autostrăzi: viteză maximă de 300 km/h\n- Pe drum național: 250 km/h\n- În oraș: 150 km/h\n\nSancțiuni pentru încălcarea vitezei permise:\n- Depășirea vitezei cu 10-50 km/h (Tip 1): Amendă $10.000\n- Depășirea vitezei cu 50-100 km/h (Tip 2): Amendă $12.000 + Reținerea permisului de conducere 1 zi\n- Depășirea vitezei cu peste 100 km/h (Tip 3): Amendă $15.000 + Reținerea permisului de conducere 2 zile"
          },
          {
            "id": "sub-pd-5-2",
            "title": "5.2 Oprirea și Parcarea Neregulamentară",
            "content": "Este calificată drept parcare neregulamentară oprirea sau staționarea unui autovehicul în spații nepermise sau care nu sunt destinate parcării (trotuare, treceri de pietoni, intersecții, benzi de circulație sau zone ce împiedică pietonii/vehiculele).\n\nSancțiuni:\n- Parcarea / Staționarea neregulamentară: Amendă $5.000\n- Oprirea neregulamentară: Amendă $5.000"
          },
          {
            "id": "sub-pd-5-3",
            "title": "5.3 Conducere Imprudentă și Infracțiuni Rutiere",
            "content": "(1) Conducerea unui vehicul fără permis: utilizarea unui vehicul pe drumurile publice de către o persoană fără permis valabil.\nAmendă: $15.000 | Sentință: 10 luni (timp RP)\n\n(2) Condusul sub influența alcoolului sau a drogurilor:\nAmendă: $25.000 | Sentință: 20 de luni + reținerea permisului 1 zi\n\n(3) Refuzul testării alcoolemiei sau drug-testului:\nAmendă: $15.000 | Sentință: 20 de luni\n\n(4) Nerespectarea marcajelor sau indicatoarelor rutiere:\nAmendă: $10.000 | Reținerea permisului 1 zi\n\n(5) Neacordarea de prioritate vehiculelor de urgență:\nAmendă: $5.000 | Reținerea permisului 1 zi\n\n(6) Nerespectarea semnalelor rutiere sau a avertizării sonore:\nAmendă: $5.000 | Reținerea permisului 2 zile\n\n(7) Trecerea pe culoarea roșie a semaforului:\nAmendă: $5.000 | Reținerea permisului 2 zile\n*(Între orele 22:00 - 10:00 semafoarele vor fi pe galben intermitent. În acest interval nu se aplică sancțiunea pentru culoarea roșie)*"
          }
        ]
      }
    ]
  },
  "smurd": {
    "title": "Regulament SMURD",
    "chapters": [
      {
        "id": "cap-smurd-1",
        "title": "Capitolul 1: Introducere",
        "subchapters": [
          {
            "id": "sub-smurd-1-1",
            "title": "1.1 Introducere generală",
            "content": "Serviciul Mobil de Urgență, Resuscitare și Descarcerare (abreviat SMURD) este o unitate de intervenție publică integrată de importanță strategică, fără personalitate juridică, structurată cu echipe integrate de resuscitare dedicate asistenței medicale și tehnice de urgență, precum și cu o echipă de personal paramedical dedicat asigurării primului ajutor calificat. Serviciul se desfășoară în cadrul Inspectoratului Județean pentru Situații de Urgență, agenția de aviație a Ministerului Afacerilor Interne acționând ca operator aerian, lucrând cu județe, spitale raionale și autorități publice locale.\n\nAcest document va conține toate informațiile disponibile despre departamentul SMURD. Toți membrii care fac parte din departamentul SMURD vor trebui să rețină toate informațiile disponibile din acest document. Dacă nu veți respecta aceste reguli, veți fi sancționați sau dați afară din acest departament. Acest document cuprinde următoarele secțiuni: Gradele din SMURD, Activitatea necesară, Sancțiunile și prețul amenzilor, regulile spitalului, codurile pentru comunicarea pe stația radio, BK-urile, mașinile SMURD și, în final, echipamentul disponibil."
          }
        ]
      },
      {
        "id": "cap-smurd-2",
        "title": "Capitolul 2: Grade SMURD",
        "subchapters": [
          {
            "id": "sub-smurd-2-1",
            "title": "2.1 Gradele Profesionale SMURD",
            "content": "Asistent Medical:\nPrimul grad din SMURD este Asistentul Medical, care constă în îngrijirea pacienților. Asistenții medicali pot lucra doar alături de un grad superior, îndeplinind instrucțiunile acestuia pentru tratarea pacienților.\n\nMedic Stagiar:\nAl doilea grad din SMURD este Paramedicul și poate fi obținut prin activitatea ta în oraș și numărul de dosare medicale în săptămâna respectivă. Acest grad poate patrula cu un grad mai inferior sau un grad mai superior. Acest lucru este obligatoriu, nu aveți voie să patrulați singuri doar dacă nu mai e nimeni în oraș sau sunteți doar 2 medici.\n\nMedic Rezident:\nAl treilea grad din SMURD este Medicul Rezident. Acest grad nu este foarte diferit de gradul de ‘Paramedic’, în schimb, va primi un salariu mai mare.\n\nMedic Specialist:\nMedicul Specialist este un grad care îți va introduce multe posibilități în cadrul departamentului medical și o autoritate mai mare față de gradele inferioare. Au posibilitatea de a patrula singuri și primesc abilitatea de a încerca pentru certificatul Moto.\n\nMedic Primar:\nMedicul Primar este al doilea grad care nu face parte din Conducere și este prevăzut ca supervizor. Aceștia sunt responsabili de gradele inferioare. Medicii Primari au autoritatea de a face liniște pe stație dacă aceasta este folosită abuziv, de asemenea primesc abilitatea de a încerca pentru certificatul HS și a deveni Tester.\n\nMedic Chirurg:\nMedicul Chirurg este singurul grad care poate face operații de orice fel. Aceștia sunt supervizori la fel ca medicii primari și au autoritatea de a acorda amenzi. Aceștia pot învăța gradele inferioare cum să performeze operații prin invitarea lor pentru a fi asistenți la operația respectivă, de asemenea primesc abilitatea de a încerca pentru certificatul Heli.\n\nMedic Inspector:\nMedici Inspectori este primul grad care face parte din conducerea Departamentului SMURD. Aceștia pot să acorde amenzi și să sancționeze după gravitatea situației. Aceștia vor avea diferite obiective în fiecare săptămână. Acești oameni au dovedit că merită gradul lor și vor avea prioritate.\n\nDirector Adjunct:\nAcești oameni sunt cei mai capabili membri ai departamentului SMURD. Acești oameni au autoritatea supremă în departamentul SMURD. Acești oameni răspund disciplinar doar Directorului General.\n\nDirector General:\nDirectorul SMURD."
          }
        ]
      },
      {
        "id": "cap-smurd-3",
        "title": "Capitolul 3: Activitate Minimă",
        "subchapters": [
          {
            "id": "sub-smurd-3-1",
            "title": "3.1 Timp de Activitate Necesar pe Săptămână",
            "content": "Această secțiune cuprinde activitatea necesară pentru fiecare săptămână.\n\nGradele următoare au de îndeplinit minimum 600 de minute pe săptămână:\n- Asistent Medical\n- Medic Stagiar\n- Medic Rezident\n\nGradele următoare au de îndeplinit minimum 720 de minute pe săptămână:\n- Medic Specialist\n- Medic Primar\n\nGradele următoare nu au de îndeplinit un minim de minute pe săptămână, dar aceștia sunt obligați să intre în oraș să își facă datoria:\n- Medic Chirurg\n- Medic Inspector\n- Director Adjunct\n- Director General"
          }
        ]
      },
      {
        "id": "cap-smurd-4",
        "title": "Capitolul 4: Reguli Interne",
        "subchapters": [
          {
            "id": "sub-smurd-4-1",
            "title": "4.1 Regulament General SMURD",
            "content": "Aceste reguli trebuie să fie respectate mereu. Toată lumea din SMURD are obligația de a le respecta:\n\n1. Toată lumea care dorește să se angajeze la spital trebuie să nu dețină niciun tatuaj la nivelul feței.\n2. Fiecare medic pe server este obligat să aibă uniforma, mașina și echipamentul gradului corespunzător și să fie pe stația IC (Frecvența 3).\n3. Abuzul de funcție precum și corupția se sancționează cu demiterea din funcție și BLACKLIST.\n4. Nu aveți voie să mergeți în patrulă singuri dacă nu sunteți mai mare în grad decât Medic Specialist. În permanență, ar trebui să fiți minim 2 per mașină.\n5. Să nu aveți sancțiuni grave pe server. (Dacă aveți corupție în istoric, nu puteți intra în departament).\n6. Nu aveți dreptul de a avea asupra dumneavoastră obiecte considerate 'letale' (arme de foc, cuțit).\n7. Cât timp sunteți off-duty, vă este interzis să faceți ilegalități sau să aveți altercații cu poliția.\n8. Nu aveți voie să vindeți truse medicale/bandaje/injecții de adrenalină civililor/mafioților.\n9. Vă dedicați majoritatea timpului petrecut în joc departamentului SMURD.\n10. Spitalul este zona în care medicii au întotdeauna prioritate.\n11. Vă este strict interzis să lăsați scaunul/targa abandonată. Dacă această regulă este încălcată, veți fi sancționat disciplinar.\n12. Vă este interzis să lăsați oameni care nu fac parte din EMS în zonele restricționate (săli de operație/consult/radiografie).\n13. Pentru a putea sta off-duty, trebuie să fie minim 2-3 medici în spital.\n14. Comanda [/me] se folosește în momentul în care caracterul tău nu poate realiza o modificarea fizică automat.\n15. Nu aveți voie să folosiți mașinile destinate EMS în scopuri personale.\n16. Trebuie să dețineți un atestat Heli pentru a putea pilota elicopterul SMURD. Sunteți responsabil de modul în care pilotați elicopterul, respectiv dacă veți crea un incident.\n17. Fiecare mașină abandonată va fi sancționată cu 1/3 FW.\n18. Aveți voie să tunați mașinile de la EMS (nu aveți voie să schimbați culoarea sau să puneți geamuri fumurii).\n19. Mașinile EMS se folosesc doar la intervenții/apeluri. Puteți merge la magazin dacă muriți de foame/sete.\n20. Nu aveți voie să folosiți mașina personală la intervenții/apeluri.\n21. Fiecare persoană din departament are obligația, când ajunge la apel, să întrebe cum a leșinat acea persoană sau ce i s-a întâmplat.\n22. În cazul în care, la un apel, nu vă puteți desfășura activitatea liniștit, atenționați persoanele din jur să înceteze, iar dacă nu încetează, puteți apel la un echipaj de poliție.\n23. Dacă vedeți că o persoană are multiple răni deschise sau este împușcată, trebuie să o duceți obligatoriu la spital pentru a primi îngrijiri de specialitate.\n24. Dacă ajungeți la un apel în care auziți focuri de armă, vă îndepărtați cât de mult puteți de acea zonă, nu ajutați pe nimeni până când nu se sfârșește situația, deoarece vă puneți viața în pericol.\n25. În caz că nu sunt apeluri, puteți patrula liniștiți prin oraș.\n26. Dacă aveți mașina avariată în proporție de peste 60%, nu aveți dreptul de a merge la apeluri, deoarece puneți viețile pacienților, cât și a dvs., în pericol.\n27. În cazul în care un jaf este în desfășurare, nu aveți voie să fiți în perimetrul acestuia. După terminarea jafului, veți fi chemați de polițiști să ajutați suspecții doborâți, cât și polițiștii. În acest caz, polițiștii au prioritate înaintea suspecților.\n28. Girofarele și sirenele sunt prioritare până la apel. Cât timp vă întoarceți la spital, nu aveți voie să mai aveți sirenele și girofarurile pornite dacă nu aveți un pacient.\n29. Vă puneți îmbrăcămintea corespunzătoare gradului dumneavoastră sau costumul moto dacă doriți să mergeți într-o patrulă moto.\n30. Vă puteți pune On-Duty/Off-Duty de la NPC-ul din vestiar.\n31. Apelurile se preiau folosind comanda '/emscalls'. Puteți să vă faceți bind: bind keyboard \"F1\" \"emscalls\".\n32. Nu aveți voie să refuzați niciun BK sau apel. Un apel se poate refuza doar în cazul în care este pe \"Insula Cayo\" și nu este nimeni cu atestat Heli pe server."
          }
        ]
      },
      {
        "id": "cap-smurd-5",
        "title": "Capitolul 5: BK-uri (Backup)",
        "subchapters": [
          {
            "id": "sub-smurd-5-1",
            "title": "5.1 Tipuri de Backup de la Organele de Poliție",
            "content": "Aici sunt detaliate cele 2 tipuri de BK (Backup) pe care le putem primi de la polițiști sau colegi medici:\n\nBK 0 - Toate unitățile să se prezinte la locația dată. Acest BK semnifică urgență maximă, asta nu înseamnă că trebuie să vă riscați viața pentru a salva pe cineva în timp ce încă se trage.\n\nBK 2 - O singură unitate medicală să se prezinte la locația dată. Acest BK semnifică urgență medie, trebuie să vă mișcați rapid la aceste apeluri."
          }
        ]
      },
      {
        "id": "cap-smurd-6",
        "title": "Capitolul 6: Mașini SMURD",
        "subchapters": [
          {
            "id": "sub-smurd-6-1",
            "title": "6.1 Reguli Utilizare Flotă Auto",
            "content": "Fiecare grad are restricții specifice de utilizare a flotei auto SMURD:\n\n- Ambulanța Blindată: Se va folosi în majoritatea intervențiilor sau apelurilor. Aceasta este singura mașină cu care ar trebui să vă duceți la BK 0. Poate fi folosită de orice grad din SMURD.\n- Mașina de Patrulă Oraș: Destinată patrulelor de oraș. Poate fi folosită de orice grad din SMURD.\n- Mașina Patrulă Off-Road: Destinată patrulelor off-road. Poate fi folosită doar de la gradul de Medic Specialist+.\n- Mașina de Patrulă Oraș (Rezident+): Poate fi folosită de Medic Rezident+.\n- Vehicul High Speed (HS): Destinată patrulelor rapide în oraș și în afara lui (fără off-road). Poate fi folosită doar de Medic Inspector+.\n- SUV de Patrulă Oraș/Exterior (Rezident+): Poate fi folosită de Medic Rezident+.\n- Mașină Intervenție Rapidă Oraș (Rezident+): Poate fi folosită de Medic Rezident+.\n- Sedan Patrulă Oraș/Exterior (Specialist+): Poate fi folosită de Medic Specialist+.\n- SUV Intervenții Oraș/Exterior (Primar+): Poate fi folosită de Medic Primar+.\n- Elicopter SMURD: În fabricație (necesită atestat Heli)."
          }
        ]
      },
      {
        "id": "cap-smurd-7",
        "title": "Capitolul 7: Echipament",
        "subchapters": [
          {
            "id": "sub-smurd-7-1",
            "title": "7.1 Echipamentul din Dotare",
            "content": "Membrii SMURD au în dotare următoarele obiecte specifice:\n\n- Stun Gun (Taser): Armă neletală utilizată în cazuri specifice de autoapărare dacă viața vă este pusă în pericol în zona spitalului.\n- Lanternă: Obiect de iluminare destinat intervențiilor pe timp de noapte.\n- Trusă Medicală: Cel mai esențial obiect. Esre folosită pentru a trata pacientul la locul faptei și a-i asigura supraviețuirea până la spital.\n- Injecție Adrenalină: Seringă utilizată pentru a injecta pacientul cu adrenalină, cu scopul de a-l stabiliza și de a reduce durerea.\n- Bandaj: Folosit pentru a sigila rănile deschise și a opri hemoragia. Se aplică de regulă după utilizarea Trusei Medicale."
          }
        ]
      }
    ]
  },
  "mafii": {
    "title": "Regulament Mafii / Gang",
    "chapters": [
      {
        "id": "cap-mafii-1",
        "title": "Capitolul 1: Reguli Generale Grupări",
        "subchapters": [
          {
            "id": "sub-mafii-1-1",
            "title": "1.1 Numărul Maxim de Membri",
            "content": "Numărul maxim de membri într-un gang neoficial este de 8 persoane, fără posibilitatea de a achiziționa sloturi suplimentare. Pentru o mafie oficială, limita este de 15 membri, putând fi extinsă prin donații până la maxim 20 de membri. Fiecare grupare are dreptul la un Lider și maxim 2 Co-Lideri."
          },
          {
            "id": "sub-mafii-1-2",
            "title": "1.2 Ore Minime și Recrutare",
            "content": "Pentru a putea fi recrutat într-o mafie sau un gang, un jucător trebuie să aibă un minimum de 75 de ore jucate pe server. Liderul are obligația de a verifica profilul jucătorului înainte de a-l adăuga în facțiune."
          }
        ]
      },
      {
        "id": "cap-mafii-2",
        "title": "Capitolul 2: Războaie și Teritorii (Turf)",
        "subchapters": [
          {
            "id": "sub-mafii-2-1",
            "title": "2.1 Reguli Turf & War",
            "content": "Războaiele de teritoriu (Turfs) se desfășoară doar în intervalul orar stabilit de conducerea serverului. Este strict interzisă utilizarea de vehicule blindate, arme nepermise pentru tipul respectiv de turf sau alianțe între două mafii diferite în timpul aceluiași conflict."
          },
          {
            "id": "sub-mafii-2-2",
            "title": "2.2 Luarea de Ostateci",
            "content": "Răpirea unui cetățean sau a unui polițist pentru a cere răscumpărare (Rob la Bancă/Magazin cu ostatec) trebuie să aibă un motiv RP solid. Este interzisă folosirea de 'ostateci falși' (prieteni sau complici din aceeași mafie). Răscumpărările maxime permise sunt stabilite clar în lista de economie a serverului."
          }
        ]
      }
    ]
  },
  "cod-penal": {
    "title": "Cod Penal",
    "chapters": [
      {
        "id": "cap-penal-1",
        "title": "Capitolul 1: Infracțiuni Rutiere",
        "subchapters": [
          {
            "id": "sub-penal-1-1",
            "title": "1.1 Articolul 1. Infracțiuni Rutiere Generale",
            "content": "1.(01) Nerespectarea marcajelor rutiere: Amenda 150.000$\n1.(02) Conducerea fara permis de conducere: Amenda 200.000$ | Sentință 25 Luni\n1.(03) Parcarea unui autovehicul neregulamentar: Amenda 125.000$\n1.(04) Accidentarea unui alt autovehicul: Amenda 150.000$\n1.(05) Nerespectarea culorii semaforului: Amenda 150.000$\n1.(06) Blocarea drumurilor publice: Amenda 300.000$\n1.(07) Claxonarea nejustificata: Amenda 50.000$\n1.(08) Derapajul necontrolat: Amenda 250.000$\n1.(09) Agresibitatea in trafic: Amenda 200.000$\n1.(10) Depasirea limitei de viteza legala: Amenda 300.000$\n1.(11) Conducerea unui autovehicul pe spatiul necarosabil: Amenda 200.000$\n1.(12) Conducerea sub influenta bauturilor alcoolice: Amenda 250.000$ | Sentință 30 Luni\n1.(13) Conducerea sub influenta substantelor stupefiante: Amenda 300.000$ | Sentință 45 Luni\n1.(14) Curse ilegale pe drumurile publice: Amenda 500.000$ | Sentință 25 Luni\n1.(15) Neacordarea de prioritate pentru vehiculele de urgenta: Amenda 200.000$\n1.(16) Sicanarea in trafic: Amenda 175.000$\n1.(17) Lipsa de licenta: Amenda 200.000$ | Sentință 20 Luni\n1.(18) Lumini After Market: Amenda 250.000$\n1.(19) Geamuri fumurii neomologate: Amenda 200.000$\n1.(20) Lumini After Market (neoane): Amenda 200.000$\n1.(21) Acoperirea fetei la volan: Amenda 250.000$"
          }
        ]
      },
      {
        "id": "cap-penal-2",
        "title": "Capitolul 2: Acuzații în Relație cu Organele Legii",
        "subchapters": [
          {
            "id": "sub-penal-2-1",
            "title": "2.1 Articolul 3. Acuzații în Relație cu Organele Legii",
            "content": "3.(01) Refuzul legitimarii la cererea unui organ al legii: Amenda 250.000$ | Sentință 15 Luni\n3.(02) Falsul in declaratii: Amenda 375.000$ | Sentință 15 Luni\n3.(03) Neconformarea si nerespectarea ordinelor unui politist: Amenda 350.000$ | Sentință 10 Luni\n3.(04) Obstructionarea unui ofitier: Amenda 375.000$ | Sentință 10 Luni\n3.(05) Inducerea in eroare a organelor de politie: Amenda 375.000$ | Sentință 15 Luni\n3.(06) Tentativa de evadare: Amenda 500.000$ | Sentință 10 Luni\n3.(07) Evadarea: Amenda 700.000$ | Sentință 30 Luni\n3.(08) Evadarea cu ajutorul violentei: Amenda 750.000$ | Sentință 60 Luni\n3.(09) Tentativa de dare de mita: Amenda 500.000$ | Sentință 20 Luni\n3.(10) Darea de mita: Amenda 700.000$ | Sentință 30 Luni\n3.(11) Ultraj: Amenda 1.000.000$ | Sentință 10 Luni\n3.(12) Intimidarea organelor de politie: Amenda 500.000$ | Sentință 25 Luni\n3.(13) Hartuirea organelor de politie: Amenda 650.000$ | Sentință 25 Luni\n3.(14) Refuzul de perchezitie: Amenda 375.000$ | Sentință 25 Luni\n3.(15) Apel fals: Amenda 250.000$ | Sentință 30 Luni\n3.(16) Fuga de politie: Amenda 500.000$ | Sentință 30 Luni\n3.(17) Opunere la arest: Amenda 375.000$ | Sentință 30 Luni\n3.(18) Obstructionarea unei anchete in desfasurare: Amenda 500.000$ | Sentință 60 Luni\n3.(19) Vatamarea corporala a unui organ al legii: Amenda 650.000$ | Sentință 60 Luni\n3.(20) Complicitatea la o actiune penala: Amenda 500.000$ | Sentință 30 Luni"
          }
        ]
      },
      {
        "id": "cap-penal-3",
        "title": "Capitolul 3: Jafuri și Răpiri",
        "subchapters": [
          {
            "id": "sub-penal-3-1",
            "title": "3.1 Articolul 5. Jafuri și Răpiri",
            "content": "5.(01) Jaf armat: Amenda 2.000.000$\n5.(02) Jefuirea unui cetatean: Amenda 1.250.000$ | Sentință 45 Luni\n5.(03) Rapirea unui cetatean: Amenda 1.250.000$ | Sentință 60 Luni\n5.(04) Rapirea unui politist: Amenda 1.500.000$ | Sentință 60 Luni\n5.(05) Tortura: Amenda 3.000.000$ | Sentință 120 Luni\n5.(06) Terorism: Amenda 5.000.000$ | Sentință 180 Luni\n5.(07) Jaf Magazin: Amenda 40$\n5.(08) Jaf Biju: Amenda 80$\n5.(09) Jaf Pacific: Amenda 150$"
          }
        ]
      },
      {
        "id": "cap-penal-4",
        "title": "Capitolul 4: Infracțiuni asupra Domeniului Privat și Public",
        "subchapters": [
          {
            "id": "sub-penal-4-1",
            "title": "4.1 Articolul 2. Infracțiuni Domeniu Privat / Public",
            "content": "2.(01) Distrugere: Amenda 150.000$ | Sentință 15 Luni\n2.(02) Furtul unui autovehicul: Amenda 200.000$ | Sentință 15 Luni\n2.(03) Violarea de domiciliu: Amenda 250.000$ | Sentință 20 Luni\n2.(04) Furtul unui bun privat: Amenda 300.000$ | Sentință 20 Luni\n2.(05) Violarea sediului profesional: Amenda 350.000$ | Sentință 25 Luni\n2.(06) Furtul din institutiile statului: Amenda 350.000$ | Sentință 25 Luni\n2.(07) Utilizarea unui bun personal fara permisiune: Amenda 150.000$ | Sentință 15 Luni\n2.(08) Deranjarea linistii publice: Amenda 150.000$\n2.(09) Instigarea la violenta: Amenda 200.000$ | Sentință 30 Luni\n2.(10) Instigarea la ura: Amenda 200.000$ | Sentință 15 Luni\n2.(11) Constituirea unui grup infractional organizat: Amenda 375.000$ | Sentință 45 Luni\n2.(12) Incalcarea proprietatii private: Amenda 175.000$ | Sentință 20 Luni\n2.(13) Patrunderea prin efractie: Amenda 250.000$\n2.(14) Patrunderea intr-o zona restrictionata: Amenda 250.000$ | Sentință 30 Luni\n2.(15) Prostitutia: Amenda 250.000$ | Sentință 30 Luni\n2.(16) Vandalism: Amenda 250.000$ | Sentință 30 Luni\n2.(17) Practicarea jocurilor de noroc in spatiul public: Amenda 375.000$ | Sentință 15 Luni\n2.(18) Eveniment neautorizat in spatiul public: Amenda 150.000$ | Sentință 30 Luni\n2.(19) Coruptie: Amenda 500.000$ | Sentință 60 Luni"
          }
        ]
      },
      {
        "id": "cap-penal-5",
        "title": "Capitolul 5: Infracțiuni privind Grupurile Infracționale",
        "subchapters": [
          {
            "id": "sub-penal-5-1",
            "title": "5.1 Articolul 4. Grupuri Infracționale Organizate",
            "content": "4.(01) Comercializarea locatiilor ilegale: Amenda 250.000$ | Sentință 30 Luni\n4.(02) Posesia de droguri: Amenda 1.000.000$ | Sentință 30 Luni\n4.(03) Posesia de carduri: Amenda 500.000$ | Sentință 20 Luni\n4.(04) Posesia si traficul de organe: Amenda 750.000$ | Sentință 30 Luni\n4.(05) Traficul de arme: Amenda 1.500.000$ | Sentință 30 Luni\n4.(06) Traficul de munitie: Amenda 500.000$ | Sentință 15 Luni\n4.(07) Colaborarea cu un grup infractional: Amenda 875.000$ | Sentință 30 Luni\n4.(08) Posesia , traficul si spalarea de bani nemarcati: Amenda 1.000.000$ | Sentință 35 Luni\n4.(09) Indreptarea unei arme asupra unei persoane: Amenda 650.000$ | Sentință 25 Luni\n4.(10) Membru al unui grup infractional: Amenda 1.500.000$ | Sentință 45 Luni\n4.(11) Utilizarea unei arme albe: Amenda 625.000$ | Sentință 25 Luni\n4.(12) Posesia unei arme de foc semi-automata: Amenda 1.250.000$ | Sentință 30 Luni\n4.(13) Vatamare corporala grava: Amenda 1.000.000$ | Sentință 30 Luni\n4.(14) Posesia unei arme de foc: Amenda 1.000.000$ | Sentință 30 Luni\n4.(15) Posesia de munitie: Amenda 750.000$ | Sentință 30 Luni"
          }
        ]
      }
    ]
  },
  "lideri": {
    "title": "Regulament Lideri",
    "chapters": [
      {
        "id": "cap-lideri-1",
        "title": "Capitolul 1: Informații Generale Lideri",
        "subchapters": [
          {
            "id": "sub-lideri-1-1",
            "title": "1.1 Informații Generale Lideri",
            "content": "7.1.1: În momentul demiterii unui membru din facțiune, motivele trebuie sa fie unele clare și într-un mod cat mai profesional. Încălcarea acestei reguli va duce la sancționarea liderului în funcție de situație cu Leader Warn.\n\n7.1.2: Liderii au obligația de a-și îndeplini îndatoririle funcției sale pe o perioada minima de 30 de zile, în caz contrar liderul o sa fie sancționat în funcție de gravitate.\n\n7.1.3: Acumularea a 3/3 Leader Warn duce la demiterea din funcția de lider cu 30 zile de transfer și, în prealabil, imposibilitatea de a mai deține funcția de lider timp de 3 luni (în orice facțiune)."
          }
        ]
      },
      {
        "id": "cap-lideri-2",
        "title": "Capitolul 2: Cerințe Minime Lideri",
        "subchapters": [
          {
            "id": "sub-lideri-2-1",
            "title": "2.1 Cerințe",
            "content": "7.2.1: Trebuie să deții minim vârsta de 16 ani.\n\n7.2.2: Ai nevoie de minim 100 de ore jucate pe server.\n\n7.2.3: Deținerea unui istoric cât mai curat, aici fiind inclus atât 'Punish Log', cât și 'Istoricul' facțiunilor.\n\n7.2.4: O vechime mai mare de 30 de zile în respectiva facțiune."
          }
        ]
      },
      {
        "id": "cap-lideri-3",
        "title": "Capitolul 3: Reguli Generale",
        "subchapters": [
          {
            "id": "sub-lideri-3-1",
            "title": "3.1 Reguli Generale",
            "content": "7.3.1: Favorizarea și abaterile de la regulament (cel al liderilor, cât și al serverului) duc la sancționarea liderului în funcție de gravitate, de la Leader Warn la demitere (la demitere se va adăuga 30 de zile transfer).\n\n7.3.2: Ca lider/co-lider nu aveți voie să jucați pe alte servere de FiveM. Încălcarea acestei reguli duce la demiterea din funcție cu 30 de zile transfer.\n\n7.3.3: Orice schimbare a regulamentului în cadrul facțiunii sau a diferitelor lucruri ce țin de facțiune trebuie discutată și aprobată de către Managerul Facțiunii voastre."
          }
        ]
      },
      {
        "id": "cap-lideri-4",
        "title": "Capitolul 4: Regulament Activitate Lideri",
        "subchapters": [
          {
            "id": "sub-lideri-4-1",
            "title": "4.1 Reguli Activitate Lideri",
            "content": "7.4.1: Raportul minim obligatoriu al unui lider este de 15 de ore jucate pe săptămână.\n\n7.4.2: Un lider are dreptul al maxim 7 zile de învoire pe lună, acestea se resetează pe data de 01 a lunii respective. În momentul în care liderul va avea o inactivitate aprobată de către manager, acesta îi va prelua toate atribuțiile până la revenirea sa."
          }
        ]
      },
      {
        "id": "cap-lideri-5",
        "title": "Capitolul 5: Regulament Co-Lideri",
        "subchapters": [
          {
            "id": "sub-lideri-5-1",
            "title": "5.1 Reguli Co-Lideri",
            "content": "7.5.1: Regulile liderilor se aplică și co-liderilor, liderul are datoria de a-l înștiința cu referire la acest regulament.\n\n7.5.2: Liderii au posibilitatea de a-și alege un singur co-lider din afara facțiunii cu acordul high staff-ului. Pentru a putea alege un co-lider din afara facțiunii, respectivul jucător trebuie să aibă în ‘Faction History’ minim 30 de zile în facțiunea respectivă.\n\n7.5.3: Promovarea la funcția de co-lider din interiorul facțiunii se va face doar dacă membrul respectiv a trecut prin toate gradele respective facțiunii (Excepție: cu acordul high staff-ului).\n\n7.5.4: Facțiunile ce dispun de 100 sau mai multe locuri au obligația de a avea un lider și maxim 4 co-lideri.\n\n7.5.5: Minimul de varsta necesar pentru a detine functia de co-lider intr-o factiune este de 16 ani."
          }
        ]
      },
      {
        "id": "cap-lideri-6",
        "title": "Capitolul 6: Reguli Rank-Up",
        "subchapters": [
          {
            "id": "sub-lideri-6-1",
            "title": "6.1 Reguli Rank-Up",
            "content": "7.6.1: Pentru a acorda rank-up unui membru acesta trebuie să aibă minim 7 zile de la ultima promovare, pe lângă cerințele suplimentare de îndeplinire a raportului.\n\n7.6.2: Dacă un membru intră în facțiune în zilele de luni, marți sau miercuri acesta are obligația de a-și completa raportul și poate primi rank-up în cazul în care îl îndeplinește."
          }
        ]
      },
      {
        "id": "cap-lideri-7",
        "title": "Capitolul 7: Reguli Teste",
        "subchapters": [
          {
            "id": "sub-lideri-7-1",
            "title": "7.1 Reguli Teste",
            "content": "7.7.1: O persoană ce a picat testul de intrare în facțiune poate aplica din nou după 48 de ore.\n\n7.7.2: Persoanele ce încearcă să fraudeze testul de intrare în facțiune vor primi blacklist timp de 30 de zile și vor fi automat respinse, picând testul."
          }
        ]
      },
      {
        "id": "cap-lideri-8",
        "title": "Capitolul 8: Reguli Sancțiuni",
        "subchapters": [
          {
            "id": "sub-lideri-8-1",
            "title": "8.1 Reguli Sancțiuni și Demiteri",
            "content": "7.8.1: Faction Warn: Sancțiunile trebuie să fie acordate doar pe baza unor dovezi clare și cu motive bine întemeiate. Dovezile sunt valabile 48 de ore. Sunt acceptate sancțiunile acordate în termenul de 48 de ore de la dovada primită sau reclamațiile asupra membrilor facțiunii. Un Faction Warn (FW) expiră după 7 zile.\n\n7.8.2: Demitere: Membrii care au ieșit dintr-o facțiune, indiferent de motivul demiterii, au posibilitatea de a intra în facțiune peste 7 zile. Inactivitatea neanunțată pe o perioadă ce depășește 3 zile consecutive va fi sancționată cu demitere și transfer în funcție de câte zile are în facțiune. Transferul nu se va mai plăti."
          }
        ]
      },
      {
        "id": "cap-lideri-9",
        "title": "Capitolul 9: Alte Reguli",
        "subchapters": [
          {
            "id": "sub-lideri-9-1",
            "title": "9.1 Reguli Diverse",
            "content": "7.9.1: Membrii banați nu pot să-și pună cerere de învoire. Au timp 72 de ore să-și plătească unban-ul / să primească unban, în caz contrar vor fi demiși urmând regula și transferul privind inactivitatea mai mare de 3 zile.\n\n7.9.2: Liderii și co-liderii au obligația de a răspunde la reclamațiile din cadrul facțiunii în maxim 24 de ore."
          }
        ]
      }
    ]
  }
};

class Database {
  constructor() {
    this.data = {
      users: [],
      rules: defaultRules,
      logs: [],
      applications: [],
      appStatus: { police: true, smurd: true, staff: true, gang: true },
      applicationLogs: []
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf8');
        this.data = JSON.parse(fileContent);
        // Asigură-te că proprietățile există în fișierul încărcat
        if (!this.data.rules || Object.keys(this.data.rules).length === 0 || !this.data.rules.general) {
          this.data.rules = defaultRules;
          this.save();
        }
        if (!this.data.logs) {
          this.data.logs = [];
          this.save();
        }
        if (!this.data.applications) {
          this.data.applications = [];
          this.save();
        }
        if (!this.data.appStatus) {
          this.data.appStatus = { police: true, smurd: true, staff: true, gang: true };
          this.save();
        }
        if (!this.data.applicationLogs) {
          this.data.applicationLogs = [];
          this.save();
        }
      } else {
        // Seed utilizator manager inițial
        const { salt, hash } = hashPassword('vipuri2026');
        this.data.users.push({
          username: 'manager_staff',
          fullName: 'Manager Principal',
          discordId: 'vipuri_staff',
          role: 'manager',
          status: 'approved',
          salt: salt,
          hash: hash,
          createdAt: new Date().toISOString()
        });
        this.data.rules = defaultRules;
        this.data.logs = [];
        this.data.applications = [];
        this.data.appStatus = { police: true, smurd: true, staff: true, gang: true };
        this.data.applicationLogs = [];
        this.save();
        console.log("Database seeded successfully with default manager_staff user.");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error("Error saving database:", error);
    }
  }

  verifyPassword(password, salt, hash) {
    const testHash = crypto.createHash('sha256').update(password + salt).digest('hex');
    return testHash === hash;
  }

  logAction(username, fullName, action) {
    if (!this.data.logs) {
      this.data.logs = [];
    }
    this.data.logs.unshift({
      timestamp: new Date().toISOString(),
      username,
      fullName,
      action
    });
    if (this.data.logs.length > 150) {
      this.data.logs = this.data.logs.slice(0, 150);
    }
    this.save();
  }

  getLogs() {
    return this.data.logs || [];
  }

  // User Management
  getUser(username) {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  createUser(username, fullName, discordId, password, requestedRole) {
    if (this.getUser(username)) {
      return { success: false, message: "Utilizatorul există deja!" };
    }

    const validRoles = ['admin', 'manager', 'tester-pd', 'tester-smurd', 'tester-staff', 'manager-mafii'];
    const assignedRole = validRoles.includes(requestedRole) ? requestedRole : 'admin';

    const { salt, hash } = hashPassword(password);
    const newUser = {
      username: username.toLowerCase().trim(),
      fullName: fullName.trim(),
      discordId: discordId.trim(),
      role: assignedRole,
      status: 'pending',
      salt: salt,
      hash: hash,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.logAction(newUser.username, newUser.fullName, `S-a înregistrat pe site cu rolul solicitat "${assignedRole.toUpperCase()}" și așteaptă aprobarea.`);
    this.save();
    return { success: true, user: newUser };
  }

  approveUser(username, adminUser, adminName) {
    const user = this.getUser(username);
    if (!user) return { success: false, message: "Utilizatorul nu a fost găsit." };
    
    user.status = 'approved';
    this.logAction(adminUser, adminName, `A aprobat cererea de staff a utilizatorului "${username}" (${user.role.toUpperCase()}).`);
    this.save();
    return { success: true, message: `Utilizatorul ${username} a fost aprobat.` };
  }

  rejectUser(username, adminUser, adminName) {
    const index = this.data.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (index === -1) return { success: false, message: "Utilizatorul nu a fost găsit." };
    
    const user = this.data.users[index];
    this.data.users.splice(index, 1);
    this.logAction(adminUser, adminName, `A respins și șters cererea de înregistrare a utilizatorului "${username}".`);
    this.save();
    return { success: true, message: `Înregistrarea utilizatorului ${user.username} a fost respinsă.` };
  }

  getPendingUsers() {
    return this.data.users.filter(u => u.status === 'pending').map(u => ({
      username: u.username,
      fullName: u.fullName,
      discordId: u.discordId,
      role: u.role,
      createdAt: u.createdAt
    }));
  }

  getActiveStaff() {
    return this.data.users.filter(u => u.status === 'approved').map(u => ({
      username: u.username,
      fullName: u.fullName,
      discordId: u.discordId,
      role: u.role,
      createdAt: u.createdAt
    }));
  }

  updateUserRole(username, newRole, adminUser, adminName) {
    const user = this.getUser(username);
    if (!user) return { success: false, message: "Utilizatorul nu a fost găsit." };
    
    const validRoles = ['admin', 'manager', 'tester-pd', 'tester-smurd', 'tester-staff', 'manager-mafii'];
    if (!validRoles.includes(newRole)) {
      return { success: false, message: "Rol invalid. Alege un rol valid din sistem." };
    }
    
    const oldRole = user.role;
    user.role = newRole;
    this.logAction(adminUser, adminName, `A schimbat rolul utilizatorului "${username}" din ${oldRole.toUpperCase()} în ${newRole.toUpperCase()}.`);
    this.save();
    return { success: true, message: `Rolul utilizatorului ${username} a fost schimbat în ${newRole}.` };
  }

  deleteUser(username, adminUser, adminName) {
    const index = this.data.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (index === -1) return { success: false, message: "Utilizatorul nu a fost găsit." };
    
    const approvedManagers = this.data.users.filter(u => u.role === 'manager' && u.status === 'approved');
    if (this.data.users[index].role === 'manager' && approvedManagers.length <= 1) {
      return { success: false, message: "Nu poți șterge ultimul Manager activ din sistem!" };
    }

    const user = this.data.users[index];
    this.data.users.splice(index, 1);
    this.logAction(adminUser, adminName, `A eliminat complet din staff utilizatorul "${username}".`);
    this.save();
    return { success: true, message: `Utilizatorul staff a fost eliminat.` };
  }

  // Rules management
  getRules() {
    return this.data.rules;
  }

  updateSubchapterContent(categoryKey, chapterId, subchapterId, content, adminUser, adminName) {
    if (!this.data.rules[categoryKey]) {
      return { success: false, message: `Categoria '${categoryKey}' nu există.` };
    }

    const category = this.data.rules[categoryKey];
    const chapter = category.chapters.find(c => c.id === chapterId);
    if (!chapter) {
      return { success: false, message: `Capitolul '${chapterId}' nu a fost găsit.` };
    }

    const subchapter = chapter.subchapters.find(s => s.id === subchapterId);
    if (!subchapter) {
      return { success: false, message: `Subcapitolul '${subchapterId}' nu a fost găsit.` };
    }

    subchapter.content = content;
    this.logAction(adminUser, adminName, `A modificat textul subcapitolului "${subchapter.title}" din categoria "${category.title}".`);
    this.save();
    return { success: true, message: "Subcapitolul a fost actualizat cu succes." };
  }

  // Application Gestiune
  getApplicationsStatus() {
    if (!this.data.appStatus) {
      this.data.appStatus = { police: true, smurd: true, staff: true, gang: true };
    }
    return this.data.appStatus;
  }

  submitApplication(type, formData) {
    if (!this.data.applications) {
      this.data.applications = [];
    }
    
    const status = this.getApplicationsStatus();
    if (!status[type]) {
      return { success: false, message: "Aplicațiile pentru această secțiune sunt momentan închise." };
    }

    const newApp = {
      id: 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      formData,
      processedBy: null,
      processedByName: null,
      processedAt: null,
      rejectReason: null
    };

    this.data.applications.push(newApp);
    
    let applicantName = "Jucător Anonim";
    if (type === 'police' && formData.numeOoc) applicantName = formData.numeOoc;
    else if (type === 'smurd' && formData.idJoc) applicantName = `ID: ${formData.idJoc}`;
    else if (type === 'staff' && formData.numeVarsta) applicantName = formData.numeVarsta;
    else if (type === 'gang' && formData.numeOoc) applicantName = formData.numeOoc;

    this.logApplicationAction(type, applicantName, 'pending', 'Sistem', `Aplicație trimisă.`);
    this.save();
    return { success: true, application: newApp };
  }

  toggleApplicationStatus(type, isOpen, adminUser, adminName) {
    if (!this.data.appStatus) {
      this.data.appStatus = { police: true, smurd: true, staff: true, gang: true };
    }
    
    this.data.appStatus[type] = isOpen;
    
    const statusText = isOpen ? "DESCHISE" : "ÎNCHISE";
    this.logAction(adminUser, adminName, `A schimbat statusul aplicațiilor pentru ${type.toUpperCase()} în ${statusText}.`);
    this.save();
    return { success: true, status: this.data.appStatus };
  }

  processApplication(appId, status, reason, adminUser, adminName) {
    if (!this.data.applications) {
      this.data.applications = [];
    }

    const app = this.data.applications.find(a => a.id === appId);
    if (!app) {
      return { success: false, message: "Aplicația nu a fost găsită." };
    }

    if (app.status !== 'pending') {
      return { success: false, message: "Aplicația a fost deja procesată." };
    }

    app.status = status; // 'accepted' or 'rejected'
    app.processedBy = adminUser;
    app.processedByName = adminName;
    app.processedAt = new Date().toISOString();
    if (status === 'rejected') {
      app.rejectReason = reason || "Nespecificat";
    }

    let applicantName = "Jucător";
    const type = app.type;
    const formData = app.formData;
    if (type === 'police' && formData.numeOoc) applicantName = formData.numeOoc;
    else if (type === 'smurd' && formData.idJoc) applicantName = `ID: ${formData.idJoc}`;
    else if (type === 'staff' && formData.numeVarsta) applicantName = formData.numeVarsta;
    else if (type === 'gang' && formData.numeOoc) applicantName = formData.numeOoc;

    const actionText = status === 'accepted' ? "Acceptat" : `Respins (Motiv: ${reason || 'Nespecificat'})`;
    this.logApplicationAction(type, applicantName, status, adminName, actionText);
    this.logAction(adminUser, adminName, `A ${status === 'accepted' ? 'acceptat' : 'respins'} aplicația (${type.toUpperCase()}) lui "${applicantName}".`);
    
    this.save();
    return { success: true, application: app };
  }

  logApplicationAction(appType, applicantName, status, processedBy, reason) {
    if (!this.data.applicationLogs) {
      this.data.applicationLogs = [];
    }
    this.data.applicationLogs.unshift({
      timestamp: new Date().toISOString(),
      appType,
      applicantName,
      status,
      processedBy,
      reason
    });
    
    if (this.data.applicationLogs.length > 200) {
      this.data.applicationLogs = this.data.applicationLogs.slice(0, 200);
    }
  }

  getApplicationLogs() {
    return this.data.applicationLogs || [];
  }

  getApplications() {
    return this.data.applications || [];
  }
}

module.exports = new Database();
