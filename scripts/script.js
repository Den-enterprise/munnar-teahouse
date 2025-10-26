// AOS (Animate On Scroll) initialization — guard in case the library isn't loaded
try{
  if (typeof AOS !== 'undefined' && typeof AOS.init === 'function') AOS.init();
}catch(e){ console.warn('AOS init skipped or failed', e); }


// Filteration Logic


  document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('[data-filter]');
    const productCards = document.querySelectorAll('.product-card');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active state from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');

        productCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  });

// ===== QUICK VIEW FUNCTIONALITY =====

// Attach click listeners to every product card (quick view)
const quickViewCards = document.querySelectorAll('.product-card .card');
if (quickViewCards && quickViewCards.length) {
  quickViewCards.forEach(card => {
    card.addEventListener('click', function (event) {
      // Skip opening modal if "Add to Cart" button is clicked
      if (event.target.closest('button')) return;

      // Get product data
      const imageEl = this.querySelector('.card-img-top');
      const nameEl = this.querySelector('.card-title');
      const priceEl = this.querySelector('.fw-semibold');

      if (!imageEl || !nameEl || !priceEl) {
        console.error('Quick view: missing expected elements in product card');
        return;
      }

      // Fill modal with card info
      const qImg = document.getElementById('quickViewImage');
      const qLabel = document.getElementById('quickViewLabel');
      const qPrice = document.getElementById('quickViewPrice');
      const qQty = document.getElementById('quickViewQuantity');
      if (qImg) qImg.src = imageEl.src;
      if (qLabel) qLabel.innerText = nameEl.textContent.trim();
      if (qPrice) qPrice.innerText = priceEl.innerText;
      if (qQty) qQty.value = 1;

      // Display modal (if Bootstrap/jQuery is available)
      if (typeof $ !== 'undefined' && $.fn && $.fn.modal) $('#quickViewModal').modal('show');
    });
  });
}

// ===== ADD TO CART INSIDE MODAL =====
// NOTE: cart handling is performed by the site-wide cart script. To avoid
// duplicate handlers and double additions we intentionally do NOT attach
// an 'add to cart' action here. The cart script will add the item and
// close the modal. If you want a page-local hook, listen for a custom
// event dispatched by the cart script instead.

// ===== OPTIONAL: CONSOLE FEEDBACK =====
console.log('Quick View script initialized — waiting for clicks.');

document.addEventListener('DOMContentLoaded', function() {
    const closeButton = document.getElementById('quickViewClose');
    const modalElement = document.getElementById('quickViewModal');

    if (closeButton && modalElement) {
        closeButton.addEventListener('click', function() {
            // This uses Bootstrap's native method to hide the modal via JavaScript
            $(modalElement).modal('hide'); 

            // If you are NOT using jQuery/Bootstrap, use the following:
            // modalElement.classList.remove('show');
            // modalElement.style.display = 'none';
            // document.body.classList.remove('modal-open'); 
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('quickViewCloseButton');
    const modal = document.getElementById('quickViewModal');

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function(event) {
            // IMPORTANT: Stop event propagation to prevent the click
            // from triggering the "close on outside click" logic.
            event.stopPropagation(); 

            // Use jQuery/Bootstrap's native JS to hide the modal
            // Assuming you have jQuery loaded (necessary for Bootstrap JS)
            if (typeof $ !== 'undefined' && $.fn.modal) {
                $(modal).modal('hide');
            } else {
                // Fallback if jQuery/Bootstrap JS is somehow missing/broken
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');

                // Manually remove the backdrop if necessary
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.parentNode.removeChild(backdrop);
                }
            }
        });
    }
});

