PROBLEME CONNU : 
Actuellement je n'arrive pas à afficher les autres utilisateurs sur la map / chatbox / webcam à cause de Vercel. 
A refaire avec une techno de socket qui supporte le serverless comme Pusher.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# LeafletMap Component

Le composant `LeafletMap` est un composant React utilisant la bibliothèque `react-leaflet` pour afficher une carte interactive avec des marqueurs personnalisés.

## Prérequis

Avant d'utiliser ce composant, assurez-vous d'avoir les dépendances suivantes installées dans votre projet :

- `react`
- `react-dom`
- `react-leaflet`
- `leaflet`
- `leaflet/dist/leaflet.css`

## Installation

Pour installer les dépendances nécessaires, exécutez les commandes suivantes :

```bash
npm install react react-dom react-leaflet leaflet 
```
Assurez-vous également d'importer le fichier CSS de Leaflet dans votre fichier principal JavaScript ou CSS :
```
import 'leaflet/dist/leaflet.css';
```

Importations :
MapContainer, TileLayer, Marker, Popup : Composants de la bibliothèque react-leaflet utilisés pour créer la carte, ajouter des couches de tuiles et des marqueurs interactifs.
L : L'objet Leaflet utilisé pour créer des icônes personnalisées.
leaflet/dist/leaflet.css : Le fichier CSS de Leaflet pour les styles par défaut des cartes.

Icône personnalisée :
Création d'une icône personnalisée en utilisant L.icon. Les propriétés définies incluent :
iconUrl : L'URL de l'image de l'icône.
iconSize : La taille de l'icône.
shadowSize : La taille de l'ombre de l'icône.
iconAnchor : Le point de l'icône qui sera positionné à la coordonnée du marqueur.
shadowAnchor : Le point de l'ombre qui sera positionné à la coordonnée du marqueur.
popupAnchor : Le point où le popup apparaîtra par rapport à l'icône.

Déclaration du composant LeafletMap :
Le composant accepte deux props : center pour centrer la carte et positions pour les positions des marqueurs.

Rendu de la carte :
MapContainer : Conteneur principal pour la carte. Il est centré sur les coordonnées fournies par la prop center, avec un niveau de zoom initial de 6, et des styles pour définir la hauteur et la largeur.
TileLayer : Couche de tuiles provenant d'OpenStreetMap. Elle utilise une URL de modèle pour charger les tuiles et une attribution pour les crédits.
Marker : Ajout de marqueurs pour chaque position dans le tableau positions. Chaque marqueur utilise l'icône personnalisée définie plus tôt.
Popup : Un popup associé à chaque marqueur affichant un texte personnalisable.

Styles CSS :
Les styles CSS sont définis en ligne pour la boîte de chat, spécifiant la bordure, le padding, la largeur, la hauteur et le comportement de défilement vertical.

# Chatbox Component

Le composant `Chatbox` est un composant React permettant d'afficher une boîte de chat interactive avec des messages en temps réel en utilisant des WebSockets.

## Prérequis

Avant d'utiliser ce composant, assurez-vous d'avoir les dépendances suivantes installées dans votre projet :

- `react`
- `socket.io-client`

## Installation

Pour installer les dépendances nécessaires, exécutez les commandes suivantes :

```bash
npm install react socket.io-client
```

Importations :
useState, useEffect, useRef : Hooks de React utilisés pour gérer l'état local, les effets secondaires et les références.

Déclaration du composant Chatbox :
Le composant accepte trois props : username, socket, et onLogout.

Gestion de l'état :
messages : Un état local pour stocker les messages du chat. Initialisé à un tableau vide.
message : Un état local pour stocker le texte du message actuellement saisi par l'utilisateur. Initialisé à une chaîne vide.

useEffect :
Utilisé pour configurer et nettoyer les effets secondaires.
Lors de l'initialisation, il configure un écouteur pour l'événement receiveMessage du socket.
Lorsque le composant est démonté ou que le socket change, l'écouteur est retiré pour éviter les fuites de mémoire.

handleSendMessage :
Vérifie si le message n'est pas vide après avoir supprimé les espaces blancs.
Crée un objet newMessage contenant l'utilisateur et le texte du message.
Envoie le message au serveur via le socket avec l'événement sendMessage.
Ajoute le nouveau message à l'état local messages et réinitialise le champ de message.

handleKeyPress :
Vérifie si la touche pressée est "Enter".
Si oui, appelle la fonction handleSendMessage.

Rendu :
Une div contenant les éléments de l'interface de chat :
Une boîte de chat (chat-box) affichant tous les messages.
Un champ de saisie pour taper un nouveau message.
Un bouton pour envoyer le message.
Un bouton pour se déconnecter en appelant onLogout.

Styles :
Styles en ligne pour la boîte de chat (chat-box), définissant la bordure, le padding, les dimensions, et le comportement de défilement.

# Express, Next.js, and Socket.IO Application

Cette application utilise Express.js pour le serveur, Next.js pour le rendu côté serveur et Socket.IO pour la communication en temps réel. Ce document fournit des instructions et des explications détaillées sur le fonctionnement du code.

## Prérequis

Avant de commencer, assurez-vous d'avoir les éléments suivants installés :

- Node.js (version 12 ou supérieure)
- npm (gestionnaire de paquets de Node.js)

# Importations
````
const express = require('express');
const next = require('next');
const http = require('http');
const { Server } = require('socket.io');
````
express : Framework web pour Node.js.
next : Framework de rendu côté serveur pour React.
http : Module HTTP natif de Node.js pour créer un serveur.
Server de socket.io : Librairie pour la communication en temps réel.

# Configuration et préparation
````
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
````
dev : Variable pour vérifier si l'environnement est en mode développement.
app : Instance de l'application Next.js.
handle : Gestionnaire de requêtes Next.js pour traiter toutes les requêtes HTTP.

# Initialisation du serveur
````
app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = new Server(httpServer);
````
Prépare l'application Next.js.
Initialise un serveur Express.
Crée un serveur HTTP.
Initialise un serveur Socket.IO sur le serveur HTTP.

# Gestion des événements Socket.IO
````
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('connect_error', (err) => {
    console.error(`Connection Error: ${err.message}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${reason}`);
  });

  socket.on('sendMessage', (message) => {
    console.log(`Message received: ${message}`);
    io.emit('receiveMessage', message);
  });

  socket.on('signal', (data) => {
    io.to(data.to).emit('signal', {
      from: socket.id,
      signal: data.signal
    });
  });

  socket.on('join', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('userJoined', socket.id);
  });

  socket.on('leave', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('userLeft', socket.id);
  });
});
````
connection : Événement déclenché lorsqu'un nouveau client se connecte.
connect_error : Événement déclenché en cas d'erreur de connexion.
disconnect : Événement déclenché lorsqu'un client se déconnecte.
sendMessage : Événement déclenché lorsqu'un client envoie un message.
signal : Événement utilisé pour la signalisation WebRTC.
join : Événement pour rejoindre une salle de chat.
leave : Événement pour quitter une salle de chat.

# Gestion des requêtes HTTP avec Next.js
````
server.all('*', (req, res) => {
  return handle(req, res);
});
````

# Démarrage du serveur HTTP
````
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${PORT}`);
});
````


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
