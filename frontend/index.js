const apiUrl = "http://localhost:3000/items";
const inputFieldEl = document.getElementById("input-field");
const addButtonEl = document.getElementById("add-button");
const shoppingListEl = document.getElementById("shopping-list");

// 🔹 Charger les éléments existants depuis Firebase
async function fetchItems() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log("🔍 Données reçues depuis Firebase :", data); // ✅ Vérification

        shoppingListEl.innerHTML = ""; // 🔹 Effacer la liste avant de la recharger

        Object.entries(data).forEach(([id, value]) => {
            console.log("📌 Élément ajouté à la liste :", { id, value }); // ✅ Debug
            appendItemToShoppingListEl({ id, value });
        });

    } catch (error) {
        console.error("❌ Erreur lors du chargement :", error);
    }
}

// 🔹 Ajouter un élément
addButtonEl.addEventListener("click", async function () {
    let inputValue = inputFieldEl.value.trim();
    console.log("🚀 Envoi au backend :", inputValue); // ✅ Vérification de la valeur envoyée

    if (inputValue !== "") {
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item: inputValue }), // Vérifier l'objet envoyé
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }

            inputFieldEl.value = "";
            fetchItems(); // Rafraîchir la liste après ajout
        } catch (error) {
            console.error("❌ Erreur lors de l'ajout :", error);
        }
    }
});

// 🔹 Ajouter un élément à la liste HTML avec les boutons Modifier et Supprimer
function appendItemToShoppingListEl(item) {
    console.log("🛠️ Ajout dans la liste :", item); // ✅ Debug

    let listItem = document.createElement("li");
    listItem.classList.add("shopping-item");

    let textEl = document.createElement("span");
    textEl.innerText = item.value;  // ✅ Correction `textContent` → `innerText`

    console.log("✅ Texte affiché :", textEl.innerText); // ✅ Debug

    // 🔹 Vérification de `item.id`
    if (!item.id) {
        console.error("❌ Erreur : item.id est undefined !", item);
        return;
    }

    // 🔹 Bouton Modifier
    let editButton = document.createElement("button");
    editButton.textContent = "Modifier";
    editButton.classList.add("edit-button");

    editButton.addEventListener("click", () => enterEditMode(listItem, textEl, item.id));

    // 🔹 Bouton Supprimer
    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Supprimer";
    deleteButton.classList.add("delete-button");

    deleteButton.addEventListener("click", async () => {
        try {
            console.log("🗑️ Suppression de l'élément :", item.id); // ✅ Debug
            await fetch(`${apiUrl}/${item.id}`, { method: "DELETE" });
            fetchItems();
        } catch (error) {
            console.error("❌ Erreur lors de la suppression :", error);
        }
    });

    // 🔹 Ajout des éléments dans la liste
    listItem.appendChild(textEl);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);
    shoppingListEl.appendChild(listItem);
}


// 🔹 Mode édition (modifier un élément)
function enterEditMode(listItem, textEl, itemID) {
    let input = document.createElement("input");
    input.type = "text";
    input.value = textEl.innerText; // ✅ Utiliser `innerText` pour éviter les problèmes

    let saveButton = document.createElement("button");
    saveButton.textContent = "Valider";
    saveButton.classList.add("save-button");

    saveButton.addEventListener("click", async () => {
        let newValue = input.value.trim();
        console.log("✏️ Modification :", newValue); // ✅ Vérification de la valeur envoyée en modification

        if (newValue !== "") {
            try {
                const response = await fetch(`${apiUrl}/${itemID}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ value: newValue }),
                });

                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}`);
                }

                fetchItems();
            } catch (error) {
                console.error("❌ Erreur lors de la mise à jour :", error);
            }
        }
    });

    listItem.innerHTML = "";
    listItem.appendChild(input);
    listItem.appendChild(saveButton);
}

// 🔹 Charger les éléments au démarrage
fetchItems();
