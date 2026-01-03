// لوحة التحكم الاحترافية - الكود الكامل
// انسخ هذا الكود وأضفه قبل إغلاق </script> في ملف index.html

// ========== المتغيرات الإضافية ==========
const ADMIN_PASSWORD = '1234'; // الرقم السري (يمكن تغييره)
let editingProductId = null;

// ========== تحميل المنتجات من localStorage ==========
function loadProductsFromStorage() {
    const saved = localStorage.getItem('storeProducts');
    if (saved) {
        products = JSON.parse(saved);
        displayProducts();
    }
}

function saveProductsToStorage() {
    localStorage.setItem('storeProducts', JSON.stringify(products));
}

// ========== المصادقة ==========
function openAdmin() {
    // عرض نافذة تسجيل الدخول
    document.getElementById('adminLoginModal').classList.add('active');
}

function checkAdminPassword() {
    const input = document.getElementById('adminPassword').value;
    const errorMsg = document.getElementById('loginError');
    
    if (input === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('adminLoginModal').classList.remove('active');
        document.getElementById('adminPassword').value = '';
        errorMsg.textContent = '';
        showAdminDashboard();
    } else {
        errorMsg.textContent = '❌ الرقم السري غير صحيح';
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('adminLoggedIn');
    hideAdminDashboard();
}

function showAdminDashboard() {
    document.getElementById('adminPanel').classList.add('active');
    document.getElementById('productsGrid').style.display = 'none';
    document.querySelector('.categories').style.display = 'none';
    document.querySelector('.search-bar').style.display = 'none';
    document.getElementById('noResults').classList.remove('active');
    
    updateAdminStats();
    renderProductsTable();
}

function hideAdminDashboard() {
    document.getElementById('adminPanel').classList.remove('active');
    document.getElementById('productsGrid').style.display = 'grid';
    document.querySelector('.categories').style.display = 'flex';
    document.querySelector('.search-bar').style.display = 'flex';
    document.getElementById('searchInput').value = '';
    displayProducts();
}

// ========== الإحصائيات ==========
function updateAdminStats() {
    const totalProducts = products.length;
    const specialOffers = products.filter(p => p.specialOffer).length;
    const outOfStock = products.filter(p => p.outOfStock).length;
    
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('specialOffers').textContent = specialOffers;
    document.getElementById('outOfStockCount').textContent = outOfStock;
}

// ========== جدول المنتجات ==========
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    
    tbody.innerHTML = products.map((p, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><img src="${p.images[0]}" width="50" height="50" alt="${p.name}"></td>
            <td>${p.name}</td>
            <td>${p.price.toLocaleString()} د.ع</td>
            <td>${getCategoryName(p.category)}</td>
            <td>
                <span class="status-badge ${p.outOfStock ? 'status-out' : 'status-available'}">
                    ${p.outOfStock ? '❌ نافذ' : '✅ متوفر'}
                </span>
            </td>
            <td>${p.specialOffer || '-'}</td>
            <td>
                <div class="table-actions">
                    <button class="edit-btn" onclick="editProduct(${p.id})" title="تعديل">✏️</button>
                    <button class="delete-btn" onclick="deleteProduct(${p.id})" title="حذف">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getCategoryName(category) {
    const categories = {
        'general': '🏠 العامة',
        'supplements': '💊 المكملات',
        'medicines': '🩺 الأدوية',
        'offers': '🎁 العروض'
    };
    return categories[category] || category;
}

// ========== إضافة منتج ==========
function showAddForm() {
    editingProductId = null;
    document.getElementById('formTitle').textContent = '➕ إضافة منتج جديد';
    document.getElementById('productFormModal').classList.add('active');
    document.getElementById('productForm').reset();
}

function saveProduct(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('formProductName').value,
        price: parseInt(document.getElementById('formProductPrice').value),
        category: document.getElementById('formProductCategory').value,
        description: document.getElementById('formProductDescription').value,
        expiryDate: document.getElementById('formExpiryDate').value,
        country: document.getElementById('formCountry').value,
        images: document.getElementById('formProductImages').value.split('\\n').map(url => url.trim()).filter(url => url),
        specialOffer: document.getElementById('formSpecialOffer').value || null,
        outOfStock: document.getElementById('formOutOfStock').checked,
        isNew: document.getElementById('formIsNew').checked
    };
    
    if (editingProductId) {
        // تعديل منتج موجود
        const index = products.findIndex(p => p.id === editingProductId);
        products[index] = {
            ...products[index],
            ...formData
        };
    } else {
        // إضافة منتج جديد
        const newProduct = {
            id: Math.max(...products.map(p => p.id), 0) + 1,
            ...formData,
            addedDate: new Date().toISOString()
        };
        products.push(newProduct);
    }
    
    saveProductsToStorage();
    renderProductsTable();
    updateAdminStats();
    displayProducts();
    closeProductForm();
    
    alert(editingProductId ? '✅ تم تحديث المنتج بنجاح!' : '✅ تم إضافة المنتج بنجاح!');
}

function closeProductForm() {
    document.getElementById('productFormModal').classList.remove('active');
    document.getElementById('productForm').reset();
    editingProductId = null;
}

// ========== تعديل منتج ==========
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    editingProductId = id;
    document.getElementById('formTitle').textContent = '✏️ تعديل المنتج';
    
    // ملء النموذج بالبيانات الحالية
    document.getElementById('formProductName').value = product.name;
    document.getElementById('formProductPrice').value = product.price;
    document.getElementById('formProductCategory').value = product.category;
    document.getElementById('formProductDescription').value = product.description;
    document.getElementById('formExpiryDate').value = product.expiryDate || '';
    document.getElementById('formCountry').value = product.country || '';
    document.getElementById('formProductImages').value = product.images.join('\\n');
    document.getElementById('formSpecialOffer').value = product.specialOffer || '';
    document.getElementById('formOutOfStock').checked = product.outOfStock || false;
    document.getElementById('formIsNew').checked = product.isNew || false;
    
    document.getElementById('productFormModal').classList.add('active');
}

// ========== حذف منتج ==========
function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    if (confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟\\n\\nهذا الإجراء لا يمكن التراجع عنه!`)) {
        products = products.filter(p => p.id !== id);
        saveProductsToStorage();
        renderProductsTable();
        updateAdminStats();
        displayProducts();
        alert('🗑️ تم حذف المنتج بنجاح!');
    }
}

// ========== تحميل البيانات عند بدء الصفحة ==========
document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromStorage();
    
    // التحقق من تسجيل الدخول
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        // لا نفتح لوحة التحكم تلقائيًا
    }
});
