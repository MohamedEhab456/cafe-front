// تحسين error handling
function handleError(error, context) {
  console.error(`Error in ${context}:`, error);

  // إظهار رسالة خطأ للمستخدم
  const errorMessage = document.createElement("div");
  errorMessage.className = "error-message";
  errorMessage.innerHTML = `
    <div class="error-content">
      <i class="fas fa-exclamation-triangle"></i>
      <span>حدث خطأ. يرجى المحاولة مرة أخرى.</span>
    </div>
  `;

  document.body.appendChild(errorMessage);

  setTimeout(() => {
    if (errorMessage.parentNode) {
      errorMessage.classList.add("fade-out");
      setTimeout(() => {
        if (errorMessage.parentNode) {
          errorMessage.remove();
        }
      }, 300);
    }
  }, 5000);
}

// تحسين localStorage management
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch (error) {
    handleError(error, "getCart");
    return [];
  }
}

function setCart(cart) {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (error) {
    handleError(error, "setCart");
  }
}

// تحسين تحميل البيانات
function loadData() {
  const loadingElement = document.querySelector(".container");
  if (loadingElement) {
    loadingElement.classList.add("loading");
  }

  fetch("data.json")
    .then((result) => {
      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }
      return result.json();
    })
    .then((data) => {
      if (loadingElement) {
        loadingElement.classList.remove("loading");
      }

      let coffeLogo = document.getElementById("cafe-logo");
      let coffeName = document.getElementById("cafe-title");

      if (coffeLogo && coffeName) {
        coffeLogo.src = data.cafe.logo;
        coffeLogo.alt = data.cafe.name + " logo";
        coffeName.textContent = data.cafe.name;
      }

      // Generate orders dynamically
      let menuTabs = document.querySelector(".menu-tabs");
      if (menuTabs) {
        menuTabs.innerHTML = "";

        // أول قسم
        let activeSection = data.sections[0].key;
        localStorage.setItem("activeSection", activeSection);

        data.sections.forEach((section) => {
          let btn = document.createElement("button");
          btn.className =
            "tab-btn" + (section.key === activeSection ? " active" : "");
          btn.dataset.section = section.key;
          btn.textContent = section.label;
          btn.setAttribute("aria-label", `عرض ${section.label}`);

          // إذا كان القسم هو العروض أضف علامة SALE
          if (section.key === "sale" || section.label === "عروض") {
            const saleTag = document.createElement("span");
            saleTag.className = "sale-tag";
            saleTag.textContent = "SALE";
            btn.appendChild(saleTag);
          }

          menuTabs.appendChild(btn);

          // When Click On btn
          btn.addEventListener("click", function () {
            let btns = document.querySelectorAll(".tab-btn");
            btns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            localStorage.setItem("activeSection", section.key);
          });
        });
      }
    })
    .catch((error) => {
      if (loadingElement) {
        loadingElement.classList.remove("loading");
      }
      handleError(error, "loadData");
    });
}

// تحسين تحميل المنتجات
function loadProducts() {
  fetch("data.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      // دائماً نبدأ من أول قسم
      let activeSection = data.sections[0].key;
      localStorage.setItem("activeSection", activeSection);

      renderProducts(data.products[activeSection]);
      updateNavigationButtons(data.sections, activeSection);

      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          let key = btn.dataset.section;
          let section = data.sections.find((s) => s.key === key);
          if (section) {
            title(section.label);
            renderProducts(data.products[key]);
            updateNavigationButtons(data.sections, key);
            closeMenu();
          }
        });
      });

      // إضافة أحداث أزرار التنقل
      setupNavigationButtons(data);
    })
    .catch((error) => {
      handleError(error, "loadProducts");
    });
}

// دالة تحديث أزرار التنقل
function updateNavigationButtons(sections, currentSection) {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const currentIndex = sections.findIndex((s) => s.key === currentSection);

  // إظهار/إخفاء زر السابق (لا يظهر في أول قسم)
  if (currentIndex > 0) {
    prevBtn.style.display = "flex";
  } else {
    prevBtn.style.display = "none";
  }

  // إظهار/إخفاء زر التالي (لا يظهر في آخر قسم)
  if (currentIndex < sections.length - 1) {
    nextBtn.style.display = "flex";
  } else {
    nextBtn.style.display = "none";
  }
}

// دالة إعداد أزرار التنقل
function setupNavigationButtons(data) {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  prevBtn.addEventListener("click", () => {
    navigateSection(data, "prev");
  });

  nextBtn.addEventListener("click", () => {
    navigateSection(data, "next");
  });
}

// دالة التنقل بين الأقسام
function navigateSection(data, direction) {
  const sections = data.sections;
  const currentSection =
    localStorage.getItem("activeSection") || sections[0].key;
  const currentIndex = sections.findIndex((s) => s.key === currentSection);

  let newIndex;
  if (direction === "prev") {
    newIndex = currentIndex - 1;
  } else {
    newIndex = currentIndex + 1;
  }

  if (newIndex >= 0 && newIndex < sections.length) {
    const newSection = sections[newIndex];
    localStorage.setItem("activeSection", newSection.key);

    // تحديث الأزرار النشطة
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.section === newSection.key) {
        btn.classList.add("active");
      }
    });

    // تحديث المحتوى
    title(newSection.label);
    renderProducts(data.products[newSection.key]);
    updateNavigationButtons(sections, newSection.key);
  }
}

// تحسين تحميل معلومات الفوتر
function loadFooterInfo() {
  fetch("data.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      const footerTitle = document.querySelector(".footer-title");
      const footerPhone = document.querySelector(".footer-phone");

      if (footerTitle && footerPhone) {
        footerTitle.textContent = "العنوان: " + data.footer.address;
        footerPhone.textContent = "الهاتف: " + data.footer.phone;
      }
    })
    .catch((error) => {
      handleError(error, "loadFooterInfo");
    });
}

// تحسين accessibility
function improveAccessibility() {
  // إضافة ARIA labels للأزرار
  const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");
  addToCartBtns.forEach((btn, index) => {
    btn.setAttribute("aria-label", `إضافة المنتج رقم ${index + 1} إلى السلة`);
  });

  // إضافة keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideCartModal();
    }
  });
}

// تحسين الأداء
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// تحسين window resize
const debouncedResize = debounce(() => {
  updateToggleButtons();
}, 250);

window.addEventListener("resize", debouncedResize);

// تحسين تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  loadProducts();
  loadFooterInfo();
  improveAccessibility();
  updateCartCount();
});

let toggleBtn = document.querySelector(".toggle-categories"); // الزر اللي تحت المنيو
let toggleBtnC = document.querySelector(".toggle-categories-c"); // الزر اللي فوق المنيو
let menuWra = document.querySelector(".menu-wrapper");
let toggleArrow = document.querySelector(".toggle-arrow");
let toggleArrowC = document.querySelector(".toggle-arrow-c");

// دالة لضبط حالة الأزرار حسب حالة المنيو
function updateToggleButtons() {
  if (menuWra.classList.contains("collapsed")) {
    toggleBtnC.classList.remove("hidden-mobile-btn");
    toggleBtn.classList.add("hidden-mobile-btn");
  } else {
    toggleBtnC.classList.add("hidden-mobile-btn");
    toggleBtn.classList.remove("hidden-mobile-btn");
  }
}

// عند تحميل الصفحة، اضبط حالة الأزرار
updateToggleButtons();

// عند الضغط على الزر اللي تحت (فتح/إغلاق المنيو)
toggleBtn.addEventListener("click", () => {
  if (menuWra.classList.contains("collapsed")) {
    // فتح المنيو
    menuWra.classList.remove("collapsed", "animate__slideOutUp");
    if (window.innerWidth <= 576) {
      menuWra.classList.add("animate__animated", "animate__slideInDown");
    }
    toggleArrow.classList.add("rotate");

    // بعد الأنيميشن
    menuWra.addEventListener("animationend", function handler() {
      menuWra.classList.remove("animate__slideInDown");
      menuWra.removeEventListener("animationend", handler);
    });

    updateToggleButtons();
  } else {
    // إغلاق المنيو
    closeMenu();
  }
});

// عند الضغط على الزر اللي فوق (إظهار المنيو لما تكون مقفولة)
toggleBtnC.addEventListener("click", () => {
  // فتح المنيو
  menuWra.classList.remove("collapsed", "animate__slideOutUp");
  if (window.innerWidth <= 576) {
    menuWra.classList.add("animate__animated", "animate__slideInDown");
  }
  toggleArrow.classList.add("rotate");

  menuWra.addEventListener("animationend", function handler() {
    menuWra.classList.remove("animate__slideInDown");
    menuWra.removeEventListener("animationend", handler);
  });

  updateToggleButtons();
});

// عند غلق المنيو (مثلاً لما تدوس على زر الإغلاق أو أي حدث آخر)
function closeMenu() {
  menuWra.classList.remove("animate__slideInDown");
  if (window.innerWidth <= 576) {
    menuWra.classList.add("animate__animated", "animate__slideOutUp");
  }
  toggleArrow.classList.remove("rotate");

  menuWra.addEventListener("animationend", function handler() {
    menuWra.classList.add("collapsed");
    menuWra.classList.remove("animate__slideOutUp");
    menuWra.removeEventListener("animationend", handler);
    updateToggleButtons();
  });
}

// Section Content

let productsContainer = document.getElementById("products-container");
let productsName = document.getElementById("pro-name");
function title(data) {
  productsName.innerHTML = "";
  productsName.innerHTML += `
       <h1>${data}</h1>
  `;
}

function renderProducts(products) {
  productsContainer.innerHTML = "";

  // تحقق أن المنتجات مصفوفة
  if (!Array.isArray(products)) {
    productsContainer.innerHTML =
      '<p style="text-align:center;color:#b9af9f">لا توجد منتجات في هذا القسم</p>';
    return;
  }

  products.forEach((product, idx) => {
    productsContainer.innerHTML += `
          <div class="box" >
            <img src="${product.img}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.desc}</p>
            <div class="price">
                ${
                  product.oldPrice
                    ? `<span class="old-price">${product.oldPrice} EG</span>`
                    : ""
                }
                <span class="current-price">${product.price} EG</span>
            </div>
            <button class="add-to-cart-btn" data-idx="${idx}">أضف إلى السلة</button>
        </div>
  `;
  });

  // إضافة حدث الضغط على كل زر "أضف إلى السلة"
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", function (event) {
      const idx = this.getAttribute("data-idx");
      addToCart(products[idx], event);
    });
  });
}

// منطق السلة
function updateCartCount() {
  const cart = getCart();
  const cartCount = document.querySelector(".cart-count");
  cartCount.textContent = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
}
function addToCart(product, event) {
  const cart = getCart();
  // تحقق إذا المنتج موجود بالفعل
  const idx = cart.findIndex((p) => p.name === product.name);
  if (idx !== -1) {
    cart[idx].qty = (cart[idx].qty || 1) + 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  setCart(cart);
  updateCartCount();

  // إظهار رسالة تأكيد
  showAddToCartMessage(product.name);

  // تفعيل أنيميشن السلة الطائرة
  if (event) {
    animateFlyingCart(event);
  }
}

// دالة إظهار رسالة تأكيد
function showAddToCartMessage(productName) {
  // إزالة الرسالة السابقة إن وجدت
  const existingMessage = document.querySelector(".add-to-cart-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // إنشاء رسالة جديدة
  const message = document.createElement("div");
  message.className = "add-to-cart-message";
  message.innerHTML = `
    <div class="message-content">
      <i class="fas fa-check-circle"></i>
      <span>تم إضافة "${productName}" إلى السلة</span>
    </div>
  `;

  document.body.appendChild(message);

  // إزالة الرسالة بعد 3 ثواني
  setTimeout(() => {
    if (message.parentNode) {
      message.classList.add("fade-out");
      setTimeout(() => {
        if (message.parentNode) {
          message.remove();
        }
      }, 300);
    }
  }, 3000);
}

// أنيميشن السلة الطائرة
function animateFlyingCart(event) {
  const flyingIcon = document.querySelector(".flying-cart-icon");
  const cartIcon = document.querySelector(".cart-icon");

  if (!flyingIcon || !cartIcon) return;

  // إعادة تعيين كاملة للأيقونة في البداية
  flyingIcon.style.transition = "none";
  flyingIcon.style.opacity = "0";
  flyingIcon.style.transform = "scale(0.5)";

  // احسب موقع الزر المضغوط بدقة
  const buttonRect = event.target.getBoundingClientRect();
  const startX = buttonRect.left + buttonRect.width / 2;
  const startY = buttonRect.top + buttonRect.height / 2;

  // احسب موقع السلة الرئيسية بدقة
  const cartRect = cartIcon.getBoundingClientRect();
  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  // ضع الأيقونة في موقع الزر المضغوط بالضبط
  flyingIcon.style.left = startX - 25 + "px";
  flyingIcon.style.top = startY - 25 + "px";

  // أعد تفعيل الانتقال بعد فترة قصيرة
  setTimeout(() => {
    flyingIcon.style.transition = "all 1.2s ease";
    flyingIcon.style.opacity = "1";
    flyingIcon.style.transform = "scale(1.3)";
  }, 50);

  // ابدأ الحركة نحو السلة
  setTimeout(() => {
    flyingIcon.style.left = endX - 25 + "px";
    flyingIcon.style.top = endY - 25 + "px";
    flyingIcon.style.transform = "scale(0.2)";
    flyingIcon.style.opacity = "0";
  }, 600);

  // أزل الأيقونة
  setTimeout(() => {
    flyingIcon.style.opacity = "0";
    flyingIcon.style.transform = "scale(0.5)";
    flyingIcon.style.transition = "none";
  }, 1800);
}
// عند تحميل الصفحة، حدث رقم السلة
updateCartCount();

/*=============== NEW ============= */

// Make the entire description area clickable
function setupReadMoreListeners() {
  document.querySelectorAll(".cart-item-info-new").forEach((infoBox) => {
    // Remove any existing event listeners to prevent duplicates
    infoBox.removeEventListener("click", handleDescriptionClick);
    // Add the new event listener
    infoBox.addEventListener("click", handleDescriptionClick);
  });
}

function handleDescriptionClick(e) {
  // Find the read-more button or the description text that was clicked
  const readMoreBtn =
    e.target.closest(".read-more") ||
    (e.target.closest("p.desc") && e.currentTarget.querySelector(".read-more"));

  if (readMoreBtn || e.target.classList.contains("desc")) {
    e.preventDefault();
    e.stopPropagation();

    const infoBox = e.currentTarget;
    const descElement = infoBox.querySelector("p.desc");
    if (!descElement) return;

    // Toggle the expanded class
    const isExpanded = descElement.classList.toggle("expanded");

    // Update the button text if it exists
    const readMoreBtn = infoBox.querySelector(".read-more");
    if (readMoreBtn) {
      readMoreBtn.textContent = isExpanded ? "اقرأ أقل" : "... اقرأ المزيد";
    }

    // Force a reflow to ensure the transition works
    void descElement.offsetWidth;
  }
}
/*=============== E NEW ============= */

// عرض نافذة السلة
const cartIcon = document.querySelector(".cart-icon");
const cartModal = document.querySelector(".cart-modal-n");
const cartItemsDiv = document.getElementById("cartItems");
const closeCartBtns = document.querySelectorAll(".close-cart-modal");

cartIcon.addEventListener("click", showCartModal);
closeCartBtns.forEach((btn) => btn.addEventListener("click", hideCartModal));

function showCartModal() {
  renderCartItems();
  cartModal.style.display = "flex";
}
function hideCartModal() {
  cartModal.style.display = "none";
}
function renderCartItems() {
  const cartItemsDiv = document.getElementById("cartItems");
  const cartTotalSpan = document.getElementById("cartTotal");
  const cart = getCart();

  if (cart.length === 0) {
    cartItemsDiv.innerHTML =
      '<p style="text-align:center;color:#b9af9f">السلة فارغة</p>';
    if (cartTotalSpan) cartTotalSpan.textContent = "0 EG";
  } else {
    let totalPrice = 0;
    cartItemsDiv.innerHTML = "";

    cart.forEach((item, idx) => {
      const priceMatch = item.price.match(/(\d+)/);
      const itemPrice = priceMatch ? parseInt(priceMatch[1]) : 0;
      const itemQty = item.qty || 1;
      const itemTotal = itemPrice * itemQty;
      totalPrice += itemTotal;
      /*=============== NEW ============= */

      let desc = item.desc || "";
      let showReadMore = desc.length > 50; // Adjust this number as needed
      /*=============== E NEW ============= */

      cartItemsDiv.innerHTML += `
      <div class="cart-item-new" data-id="${idx}">
        <div class="cart-item-box">
          <div class="cart-item-actions">

            <span class="cart-item-price">${itemTotal} EG</span>

<!--=========== NEW =========-->
                          <div class="casher">  
<!--=========== E NEW =========-->
            <button class="quantity-btn" data-idx="${idx}" data-action="decrease">-</button>
            <span class="number">${itemQty}</span>
            <button class="quantity-btn" data-idx="${idx}" data-action="increase">+</button>
          </div>
            </div>
          <div class="cart-item-info-new">
            <h4>${item.name}</h4>
<!--=========== NEW =========-->
            
              <p class="desc">${desc}</p>
              ${
                showReadMore
                  ? '<span class="read-more">... اقرأ المزيد</span>'
                  : ""
              }
          </div>
<!--=========== E NEW =========-->

        </div>
        <span class="close remove-item" data-idx="${idx}" title="حذف المنتج">&times;</span>
      </div>
      `;
    });

    if (cartTotalSpan) cartTotalSpan.textContent = `${totalPrice} EG`;
  }
  // Set up the read more listeners after rendering the cart
  /*=============== NEW ============= */
  setupReadMoreListeners();
  /*=============== E NEW ============= */

  // أحداث الكمية
  cartItemsDiv.querySelectorAll(".quantity-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const idx = +this.getAttribute("data-idx");
      const action = this.getAttribute("data-action");
      updateCartItemQty(idx, action);
    });
  });

  // حذف منتج
  cartItemsDiv.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", function () {
      const idx = +this.getAttribute("data-idx");
      removeCartItem(idx);
    });
  });

  // أزرار الفوتر
  const clearCartBtn = document.getElementById("clearCart");
  const checkoutBtn = document.getElementById("checkout");

  if (clearCartBtn) {
    clearCartBtn.onclick = function () {
      setCart([]);
      renderCartItems();
      updateCartCount();
    };
  }
  if (checkoutBtn) {
    checkoutBtn.onclick = hideCartModal;
  }

  // زر الإغلاق في الهيدر
  const closeHeaderBtn = document.querySelector(".modal-header .close");
  if (closeHeaderBtn) {
    closeHeaderBtn.onclick = hideCartModal;
  }

  // إظهار/إخفاء الأزرار حسب حالة السلة
  if (cart.length === 0) {
    if (clearCartBtn) clearCartBtn.style.display = "none";
    if (checkoutBtn) checkoutBtn.style.display = "block";
  } else {
    if (clearCartBtn) clearCartBtn.style.display = "block";
    if (checkoutBtn) checkoutBtn.style.display = "block";
  }
}
function updateCartItemQty(idx, action) {
  const cart = getCart();
  if (action === "increase") {
    cart[idx].qty = (cart[idx].qty || 1) + 1;
  } else if (action === "decrease") {
    cart[idx].qty = (cart[idx].qty || 1) - 1;
    if (cart[idx].qty < 1) cart[idx].qty = 1;
  }
  setCart(cart);
  renderCartItems();
  updateCartCount();
}
function removeCartItem(idx) {
  const cart = getCart();
  cart.splice(idx, 1);
  setCart(cart);
  renderCartItems();
  updateCartCount();
}

let searchInput = document.getElementById("product-search");
let allProducts = {};
let currentSection = null;

function loadAllProducts() {
  fetch("data.json")
    .then((res) => res.json())
    .then((data) => {
      allProducts = data.products;
      currentSection =
        localStorage.getItem("activeSection") || data.sections[0].key;

      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          currentSection = btn.dataset.section;
          localStorage.setItem("activeSection", currentSection); // أضف هذا السطر
          renderProducts(allProducts[currentSection]);
        });
      });
    });
}
loadAllProducts();

searchInput.addEventListener(
  "input",
  debounce(function (e) {
    let query = e.target.value.trim().toLowerCase();
    // استخدم القسم النشط من localStorage فقط
    let activeSection =
      localStorage.getItem("activeSection") || Object.keys(allProducts)[0];
    if (!query) {
      renderProducts(allProducts[activeSection]);
      return;
    }
    let filtered = (allProducts[activeSection] || []).filter((product) =>
      product.name.toLowerCase().includes(query)
    );
    renderProducts(filtered);
  }, 200)
);

const scrollBtn = document.getElementById("scrollToTopBtn");
const progressCircle = document.querySelector(".progress-ring__circle");
const radius = 22;
const circumference = 2 * Math.PI * radius;

progressCircle.style.strokeDasharray = `${circumference}`;
progressCircle.style.strokeDashoffset = `${circumference}`;

function setProgress(percent) {
  const offset = circumference - percent * circumference;
  progressCircle.style.strokeDashoffset = offset;
}

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = docHeight ? scrollTop / docHeight : 0;
  setProgress(percent);

  if (scrollTop > 200) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// تحسين تحميل روابط التواصل الاجتماعي
function loadSocialLinks() {
  fetch("data.json")
    .then((res) => res.json())
    .then((data) => {
      const social = data.social || {};
      // لاحظ هنا: نبحث عن العنصر بواسطة الكلاس وليس id
      const socialLinksDiv = document.querySelector(".social-links");
      if (!socialLinksDiv) return;

      const icons = {
        facebook: "fab fa-facebook-f",
        instagram: "fab fa-instagram",
        twitter: "fab fa-twitter",
        whatsapp: "fab fa-whatsapp",
        tiktok: "fab fa-tiktok",
        youtube: "fab fa-youtube",
        telegram: "fab fa-telegram-plane",
        snapchat: "fab fa-snapchat-ghost",
        linkedin: "fab fa-linkedin-in",
      };

      let html = "";
      Object.keys(social).forEach((key) => {
        if (social[key] && icons[key]) {
          html += `<a href="${social[key]}" target="_blank"><i class="${icons[key]}"></i></a>`;
        }
      });

      socialLinksDiv.innerHTML = html;
    });
}

document.addEventListener("DOMContentLoaded", loadSocialLinks);

// دالة تحميل بيانات الاتصال (العنوان والرقم) في قسم Contact Us فقط
function loadContactInfo() {
  fetch("data.json")
    .then((res) => res.json())
    .then((data) => {
      const contactDiv = document.getElementById("contact-content");
      if (!contactDiv) return;

      let html = "";

      // الهاتف
      if (data["contact-us"] && data["contact-us"].phone) {
        html += `
          <div class="contact-item">
            <div>
              <h3>الهاتف</h3>
              <p>${data["contact-us"].phone}</p>
            </div>
            <a href="tel:${data["contact-us"].phone}" target="_blank">
              <i class="fas fa-phone"></i>
            </a>
          </div>
        `;
      }

      // العنوان
      if (data["contact-us"] && data["contact-us"].address) {
        html += `
          <div class="contact-item">
            <div>
              <h3>العنوان</h3>
              <p>${data["contact-us"].address}</p>
            </div>
            <i class="fas fa-map-marker-alt"></i>
          </div>
        `;
      }

      contactDiv.innerHTML = html;
    });
}

document.addEventListener("DOMContentLoaded", loadContactInfo);

fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    if (!data.sections || !Array.isArray(data.sections)) {
      handleError("sections غير موجودة أو ليست مصفوفة", "loadData");
      return;
    }
    data.sections.forEach((section) => {
      // ... باقي الكود ...
    });
  })
  .catch((error) => handleError(error, "loadData"));
