# UpNorth

Magasin de vente crée dans le cadre d'un cours

# Site

[UpNorth en ligne](https://upnorth-cegep.herokuapp.com/) **inscription ne marche pas, car c'est en mode sandbox (amazon SES)**

# Utilisation

1. Installer nodejs (version récente)
2. Cloner ce projet
3. Aller dans le dossier cloné `cd upnorth-projet`
4. Télécharger paquets nécessaires `npm install`
5. Installer nodemon `npm install nodemon`
6. Remplir le fichier `.env` avec les bonnes valeurs
7. Lancer l'application

# Fonctionnalités

- En tant qu'utilisateur :

  1. **Compte :**

     - Je pourrais me créer un compte
     - Je pourrais me connecter à me compte et voir les informations suivantes sur moi :
     - Mon identifiant, mon adresse, mon nom et prénom, mon numéro de téléphone, mon âge et si je suis administrateur (statut)
     - Je pourrais aussi changer toutes les informations sur moi, sauf mon identifiant
     - Je pourrais voir mon historique de commande, ce qui comprend :
     - L'identifiant de la commande, le prix total, l'identifiant des articles, le nom des articles, la quantité par article, le prix de chaque article
     - Je pourrais me déconnecter de mon compte
     - Je pourrais récupérér mon mot de passe si je l'oubli

  2. **Compte (administrateur) :**

     - Je pourrais modifier les informations de certains articles à partir du site web
     - Je pourrais discontinuer des articles pour qu'ils ne soient plus affichés sur le site
     - Je pourrais voir les articles discontinués en stock
     - Je pourrais remettre des articles discontinués en stock

  3. **Recherche :**

     - Si je visite la page d'accueil, je pourrais voir une liste de 3 à 4 articles de toutes les catégories disponibles
     - Je pourrais chercher des articles selon :
       - Le nom et la catégorie
     - Je pourrais voir les informations sur un article bien précis :
       - L'identifiant, le nom, le prix, l'image (si disponible), le sexe à qui l'article est destiné (h/f), la description, la catégorie et les tailles

  4. **Commande :**

     - Je pourrais ajouter et retirer des articles de mon panier d'achats
     - Je devrais être connecté avant de pouvoir commander mes articles de mon panier
     - Je pourrais voir une page de confirmation avec un résumé de la commande avant de payer. Le résumé de la commande devra contenir les informations suivantes :
       - Le nom des articles, leur prix, la quantité par article et l'adresse de facturation
     - Si je ferme la page web, les articles dans mon panier doivent toujours être disponibles au même endroit.

# Technologies

Technologies utilisées : Html, Css, Javacscript, Nodejs, Expressjs, Mongodb, Aws (SES), Stripe, Heroku
