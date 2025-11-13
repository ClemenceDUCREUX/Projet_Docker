import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";

// Charger le fichier JSON contenant la clé Firebase Admin SDK
const serviceAccount = JSON.parse(fs.readFileSync("./firebaseServiceAccountKey.json", "utf-8"));

// Initialisation de Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://projetdocker-2551b-default-rtdb.europe-west1.firebasedatabase.app/"
});

const database = admin.database();
const shoppingListRef = database.ref("shoppingList");

const app = express();
app.use(cors());
app.use(express.json());
app.get('/favicon.ico', (req, res) => res.status(204));

// Récupérer les éléments
app.get("/items", async (req, res) => {
  try {
    const snapshot = await shoppingListRef.once("value");
    res.json(snapshot.val() || {});
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des éléments" });
  }
});

// Ajouter un élément
app.post("/items", async (req, res) => {
  try {
    const { item } = req.body;
    const newItemRef = shoppingListRef.push();
    await newItemRef.set(item);
    res.status(201).json({ id: newItemRef.key, value: item });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'ajout" });
  }
});

// Modifier un élément
app.put("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    await shoppingListRef.child(id).set(value);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// Supprimer un élément
app.delete("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await shoppingListRef.child(id).remove();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// Lancer le serveur
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur http://localhost:${PORT}`));
