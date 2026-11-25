import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Replace every placeholder with the values from your Firebase project settings.
const firebaseConfig = {
  apiKey: 'PASTE_API_KEY',
  authDomain: 'PASTE_AUTH_DOMAIN',
  projectId: 'PASTE_PROJECT_ID',
  storageBucket: 'PASTE_STORAGE_BUCKET',
  messagingSenderId: 'PASTE_MESSAGING_SENDER_ID',
  appId: 'PASTE_APP_ID'
};
const OWNER_EMAIL = 'lambhateishwari@gmail.com';
const configReady = Object.values(firebaseConfig).every(v => typeof v === 'string' && v && !v.startsWith('PASTE_'));
const $ = id => document.getElementById(id);
let categories = [], dishes = [], editingId = null;

$('ownerToggle').addEventListener('click', () => {
  $('loginPanel').classList.toggle('hidden');
  $('adminPanel').classList.add('hidden');
});
$('closeLogin').addEventListener('click', () => {
  $('loginPanel').classList.add('hidden'); $('loginMsg').textContent = '';
});
$('email').value = OWNER_EMAIL; $('email').readOnly = true;

if (!configReady) {
  $('status').textContent = 'Firebase setup is required before the menu can load. Follow README.txt.';
  $('login').disabled = true;
} else {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const categoriesCol = collection(db, 'categories');
  const dishesCol = collection(db, 'dishes');

  $('login').addEventListener('click', async () => {
    $('loginMsg').textContent = '';
    try { await signInWithEmailAndPassword(auth, OWNER_EMAIL, $('password').value); }
    catch { $('loginMsg').textContent = 'Login failed. Check your email and password.'; }
  });
  $('logout').addEventListener('click', () => signOut(auth));
  onAuthStateChanged(auth, user => {
    if (user && user.email === OWNER_EMAIL) {
      $('loginPanel').classList.add('hidden'); $('adminPanel').classList.remove('hidden'); refresh();
    } else {
      $('adminPanel').classList.add('hidden');
      if (user) signOut(auth);
    }
  });

  async function refresh() {
    try {
      const [c, d] = await Promise.all([getDocs(categoriesCol), getDocs(dishesCol)]);
      categories = c.docs.map(x => ({ id: x.id, ...x.data() }));
      dishes = d.docs.map(x => ({ id: x.id, ...x.data() }));
      render(); $('status').textContent = categories.length ? '' : 'Menu is currently empty.';
    } catch (err) { $('status').textContent = 'Unable to load menu. Check Firebase and Firestore rules.'; }
  }
  function render() {
    const menu = $('menu'); menu.replaceChildren();
    categories.forEach(cat => {
      const section = document.createElement('section'); section.className = 'category';
      const title = document.createElement('h2'); title.textContent = cat.name; section.append(title);
      dishes.filter(d => d.categoryId === cat.id).forEach(d => {
        const item = document.createElement('div'); item.className = 'item';
        if (d.image) { const img = document.createElement('img'); img.src = d.image; img.alt = d.name; img.loading = 'lazy'; item.append(img); }
        const details = document.createElement('div'); details.className = 'details';
        const h = document.createElement('h3'); h.textContent = d.name; details.append(h);
        if (d.description) { const p = document.createElement('p'); p.textContent = d.description; details.append(p); }
        item.append(details); const price = document.createElement('span'); price.className = 'price'; price.textContent = '₹' + Number(d.price).toLocaleString('en-IN'); item.append(price); section.append(item);
      }); menu.append(section);
    });
    const sel = $('dishCategory'); sel.replaceChildren(); categories.forEach(c => { const o = document.createElement('option'); o.value = c.id; o.textContent = c.name; sel.append(o); });
    const catList = $('categoryList'); catList.replaceChildren();
    categories.forEach(c => {
      const row = document.createElement('div'); row.className = 'rowManage categoryManage'; const span = document.createElement('span'); span.textContent = c.name; row.append(span);
      const del = document.createElement('button'); del.textContent = 'Delete'; del.className = 'secondary';
      del.addEventListener('click', async () => { if (dishes.some(d => d.categoryId === c.id)) { alert('Delete this category’s dishes first.'); return; } if (confirm(`Delete category ${c.name}?`)) { await deleteDoc(doc(db, 'categories', c.id)); refresh(); } });
      row.append(del); catList.append(row);
    });
    const dishList = $('dishList'); dishList.replaceChildren();
    dishes.forEach(d => {
      const row = document.createElement('div'); row.className = 'rowManage'; const span = document.createElement('span'); span.textContent = `${d.name} — ₹${d.price} (${categories.find(c => c.id === d.categoryId)?.name || 'Uncategorised'})`; row.append(span);
      const edit = document.createElement('button'); edit.textContent = 'Edit'; edit.addEventListener('click', () => startEdit(d)); row.append(edit);
      const del = document.createElement('button'); del.textContent = 'Delete'; del.className = 'secondary'; del.addEventListener('click', async () => { if (confirm(`Delete ${d.name}?`)) { await deleteDoc(doc(db, 'dishes', d.id)); refresh(); } }); row.append(del); dishList.append(row);
    });
  }
  $('addCategory').addEventListener('click', async () => { const name = $('categoryName').value.trim(); if (!name) return; try { await addDoc(categoriesCol, { name }); $('categoryName').value = ''; refresh(); } catch { $('adminMsg').textContent = 'Could not add category. Check permissions.'; } });
  $('saveDish').addEventListener('click', async () => {
    const name = $('dishName').value.trim(), price = $('dishPrice').value, categoryId = $('dishCategory').value;
    if (!name || price === '' || !categoryId || Number(price) < 0) { $('adminMsg').textContent = 'Enter a dish name, valid price and category.'; return; }
    const data = { name, price: Number(price), categoryId, description: $('dishDescription').value.trim(), image: $('dishImage').value.trim() };
    try { if (editingId) await updateDoc(doc(db, 'dishes', editingId), data); else await addDoc(dishesCol, data); resetDishForm(); $('adminMsg').textContent = 'Saved.'; refresh(); }
    catch { $('adminMsg').textContent = 'Save failed. Check Firestore permissions.'; }
  });
  function startEdit(d) { editingId = d.id; $('dishName').value = d.name; $('dishPrice').value = d.price; $('dishDescription').value = d.description || ''; $('dishImage').value = d.image || ''; $('dishCategory').value = d.categoryId; $('saveDish').textContent = 'Save changes'; $('cancelEdit').classList.remove('hidden'); }
  function resetDishForm() { editingId = null; $('dishName').value = ''; $('dishPrice').value = ''; $('dishDescription').value = ''; $('dishImage').value = ''; $('saveDish').textContent = 'Add dish'; $('cancelEdit').classList.add('hidden'); }
  $('cancelEdit').addEventListener('click', resetDishForm);
  refresh();
}
