// Shared cart script for Munnar Tea House
(function(){
  const CART_KEY = 'mt_cart_v1';

  function readCart(){
    try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){ return []; }
  }
  function writeCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  function formatPrice(n){ return '₹' + (Math.round(n)).toLocaleString('en-IN'); }

  function findProductDataFromCard(btn){
    const card = btn.closest('.product-card');
    if(!card) return null;
    const title = card.querySelector('.card-title')?.textContent.trim() || 'Product';
    const img = card.querySelector('.card-img-top')?.src || '';
    const price = parseInt((card.querySelector('.fw-semibold')?.textContent||card.querySelector('.fw-bold')?.textContent||'').replace(/[^0-9]/g,'')) || parseInt(card.getAttribute('data-price')||0) || 0;
    const id = card.getAttribute('data-id') || card.getAttribute('data-original-order') || title;
    return { id: String(id), title, img, price };
  }

  // UI references will be resolved on init
  let cartToast, cartToastMessage, openCartBtn, cartPanel, cartItemsEl, cartSubtotalEl, checkoutBtn, clearCartBtn, closeCartBtn, navbarCartBtn, navbarCountEl, widget;

  function ensureUI(){
    cartToast = document.getElementById('cartToast');
    cartToastMessage = document.getElementById('cartToastMessage');
    openCartBtn = document.getElementById('openCartBtn');
    cartPanel = document.getElementById('cartPanel');
    cartItemsEl = document.getElementById('cartItems');
    cartSubtotalEl = document.getElementById('cartSubtotal');
    checkoutBtn = document.getElementById('checkoutBtn');
    clearCartBtn = document.getElementById('clearCartBtn');
    closeCartBtn = document.getElementById('closeCartBtn');
    navbarCartBtn = document.getElementById('navbarCartBtn');
    navbarCountEl = document.getElementById('navbarCartCount');
    widget = document.getElementById('cartWidget');
  }

  function showToast(msg){
    try{
      console.info('cart: showToast ->', msg);
      if(!widget) widget = document.getElementById('cartWidget');
      if (widget && widget.style.display === 'none') widget.style.display = '';
      if(cartToastMessage) cartToastMessage.textContent = msg;
      if(cartToast) {
        if(widget) widget.style.zIndex = 1500;
        cartToast.style.display = 'flex';
        cartToast.style.opacity = '1';
        cartToast.style.transform = 'translateY(0)';
        cartToast.style.zIndex = '1200';
        cartToast.classList.add('visible');
      }
      const cartNow = readCart();
      if (!cartNow || cartNow.length === 0){
        setTimeout(()=>{ 
          try{ if(cartToast) { cartToast.classList.remove('visible'); cartToast.style.opacity=''; cartToast.style.transform=''; cartToast.style.display=''; } }catch(_){ }
        }, 2200);
      }
    }catch(e){ console.warn('Toast failed', e); }
  }

  function renderCart(){
    ensureUI();
    const cart = readCart();
    if(!cartItemsEl) return;
    cartItemsEl.innerHTML = '';
    let subtotal = 0;
    cart.forEach(item=>{
      subtotal += item.price * item.qty;
      const row = document.createElement('div'); row.className = 'cart-item d-flex align-items-center gap-2 py-2';
      row.innerHTML = `
        <img src="${item.img}" class="cart-item-img rounded" alt="">
        <div class="flex-grow-1">
          <div class="fw-semibold">${item.title}</div>
          <div class="small text-muted">${formatPrice(item.price)} × <span class="cart-qty">${item.qty}</span></div>
        </div>
        <div class="d-flex flex-column align-items-end">
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-secondary cart-decrease">-</button>
            <button class="btn btn-outline-secondary cart-increase">+</button>
          </div>
          <button class="btn btn-link text-danger btn-sm cart-remove">Remove</button>
        </div>
      `;
      row.querySelector('.cart-increase').addEventListener('click', ()=>{ updateQty(item.id, item.qty+1); });
      row.querySelector('.cart-decrease').addEventListener('click', ()=>{ updateQty(item.id, Math.max(1, item.qty-1)); });
      row.querySelector('.cart-remove').addEventListener('click', ()=>{ removeItem(item.id); });
      cartItemsEl.appendChild(row);
    });
    if(cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(subtotal);
    if(openCartBtn) openCartBtn.textContent = `View (${readCart().reduce((s,i)=>s+i.qty,0)})`;
    try{ if(navbarCountEl) navbarCountEl.textContent = readCart().reduce((s,i)=>s+i.qty,0); }catch(_){ }
    if(widget){
      if(cart.length > 0){ widget.style.display = 'block'; }
      else { widget.style.display = 'none'; if(cartPanel) { cartPanel.classList.remove('open'); cartPanel.setAttribute('aria-hidden','true'); } try{ if(cartToast) { cartToast.classList.remove('visible'); cartToast.style.display='none'; } }catch(_){ } }
    }
  }

  function addItemToCart(product, qty=1){
    const cart = readCart();
    const existing = cart.find(i=>i.id === product.id);
    if(existing){ existing.qty += qty; }
    else cart.push(Object.assign({}, product, { qty }));
    writeCart(cart); renderCart(); showToast(`${product.title} added to cart`);
  }

  function updateQty(id, qty){
    const cart = readCart();
    const it = cart.find(i=>i.id===id); if(!it) return;
    it.qty = qty; writeCart(cart); renderCart();
  }

  function removeItem(id){
    let cart = readCart(); cart = cart.filter(i=>i.id!==id); writeCart(cart); renderCart();
  }

  function clearCart(){ localStorage.removeItem(CART_KEY); renderCart(); }

  function getCheckoutPayload(){
    const cart = readCart();
    const subtotal = cart.reduce((s,i)=>s + (i.price||0) * (i.qty||0), 0);
    const totalQty = cart.reduce((s,i)=>s + (i.qty||0), 0);
    const payload = {
      createdAt: new Date().toISOString(),
      currency: 'INR',
      subtotal: subtotal,
      totalItems: totalQty,
      items: cart.map(i=>({ id: i.id, title: i.title, price: i.price, qty: i.qty, img: i.img }))
    };
    return payload;
  }

  function initBindings(){
    ensureUI();
    // Close button for toast
    const cartToastClose = document.getElementById('cartToastClose');
    if(cartToastClose){ cartToastClose.addEventListener('click', ()=>{ try{ if(cartToast) cartToast.style.display='none'; }catch(_){} }); }
    // Navbar cart button
    if(navbarCartBtn){ navbarCartBtn.addEventListener('click', ()=>{ if(cartPanel){ cartPanel.classList.toggle('open'); cartPanel.setAttribute('aria-hidden', String(!cartPanel.classList.contains('open'))); } }); }

    // direct bindings for product buttons
    const productAddButtons = document.querySelectorAll('.product-card .btn-success');
    if(productAddButtons && productAddButtons.length){
      productAddButtons.forEach(btn=>{
        try{ btn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); const pd = findProductDataFromCard(this); if(!pd) return; addItemToCart(pd, 1); }); }catch(e){ console.warn('Failed binding product add button', e); }
      });
    }

    // modal add buttons
    const modalAddButtons = document.querySelectorAll('#addToCartButton');
    if(modalAddButtons && modalAddButtons.length){
      modalAddButtons.forEach(mbtn=>{ try{ mbtn.addEventListener('click', function(e){ try{ e.preventDefault(); }catch(_){ } const title = document.getElementById('quickViewLabel')?.innerText?.trim(); if(!title) return; const img = document.getElementById('quickViewImage')?.src || ''; const priceText = (document.getElementById('quickViewPrice')?.innerText || ''); const price = parseInt(priceText.replace(/[^0-9]/g,'')) || 0; const qty = parseInt(document.getElementById('quickViewQuantity')?.value) || 1; const id = 'modal-' + title; addItemToCart({ id: id, title: title, img: img, price: price }, qty); try{ if (typeof $ !== 'undefined' && $.fn && $.fn.modal) $('#quickViewModal').modal('hide'); else { const modal = document.getElementById('quickViewModal'); if(modal){ modal.classList.remove('show'); modal.style.display='none'; document.body.classList.remove('modal-open'); const backdrop = document.querySelector('.modal-backdrop'); if(backdrop) backdrop.remove(); } } }catch(_){ } }); }catch(e){ console.warn('Failed binding modal add button', e); } });
    }

    // delegated fallback for buttons in case new buttons are added dynamically
    document.addEventListener('click', function(e){
      const prodBtn = e.target.closest && e.target.closest('.product-card .btn-success');
      if(!prodBtn) return;
      try{ e.preventDefault(); e.stopPropagation(); }catch(_){ }
      const pd = findProductDataFromCard(prodBtn);
      if(pd) addItemToCart(pd, 1);
      else console.warn('cart: delegated handler could not find product data');
    });

    if(openCartBtn) { openCartBtn.addEventListener('click', ()=>{ if(cartPanel){ cartPanel.classList.toggle('open'); cartPanel.setAttribute('aria-hidden', String(!cartPanel.classList.contains('open'))); } }); }
    if(closeCartBtn) { closeCartBtn.addEventListener('click', ()=>{ if(cartPanel){ cartPanel.classList.remove('open'); cartPanel.setAttribute('aria-hidden','true'); } }); }
    if(clearCartBtn) { clearCartBtn.addEventListener('click', ()=>{ if(confirm('Clear cart?')){ clearCart(); } }); }
    if(checkoutBtn) {
      checkoutBtn.addEventListener('click', ()=>{
        try{
          const payload = getCheckoutPayload();
          // store payload both on the MTCart object and in localStorage so other pages can read it
          window.MTCart.pendingCheckout = payload;
          localStorage.setItem('mt_checkout_payload', JSON.stringify(payload));
          // navigate to a local checkout page which will show the payload and allow confirming payment
          // Change this URL to your third-party integration endpoint if you prefer to POST directly
          window.location.href = 'checkout.html';
        }catch(e){ console.warn('checkout failed', e); }
      });
    }
  }

  // expose for tests and external hooks
  window.MTCart = { readCart, writeCart, addItemToCart, updateQty, removeItem, clearCart, renderCart, getCheckoutPayload };

  // initialize when DOM is ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ initBindings(); renderCart(); });
  else { initBindings(); renderCart(); }

})();
