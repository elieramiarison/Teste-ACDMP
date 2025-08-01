# Teste-ACDMP

# Analyse Automatique de Documents Administratifs

Ce projet a été réalisé dans le cadre d’un test technique pour l’entreprise **ACDMP**.  
Il permet d’analyser un fichier ZIP contenant des documents administratifs PDF, et d’identifier automatiquement :

- Les types de documents présents (Kbis, DC1, etc.)
- Les dates de validité extraites des fichiers PDF
- Les documents expirés ou manquants
- Un résumé clair du résultat au format JSON (et optionnellement affiché dans une interface simple)

---

## Fonctionnalités

- Analyse automatique d’un fichier ZIP
- Détection des types de documents via mots-clés
- Extraction de texte avec `pdf-parse` et OCR fallback (`tesseract`)
- Détection des dates de validité via expressions régulières
- Retour d’un résumé clair en JSON :
  - `documents[]` : tous les documents reconnus
  - `missing[]` : les types attendus non trouvés
  - `expired[]` : les documents expirés

---

## Lancer le projet

### 1. Cloner le dépôt
CLoner avec git clone
###  2. Installer les dépendances
npm install

### 3. Lancer le serveur
npm run dev

### 4. Lancer l'interface web
cd simpleInterface
npm install
npm run dev


## NB: - Le dossier sur l'interface est nomme simpleInterface
       - S'il y a d'autres types des fichiers administration, je peux l'ajouter 