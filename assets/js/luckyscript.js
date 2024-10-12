
  document.querySelectorAll('.book').forEach(function(book) {
    book.addEventListener('mouseenter', function() {
      // Show the overlay and its content
      const overlay = this.querySelector('.book-info');
      overlay.classList.remove('d-none');
    });
    book.addEventListener('mouseleave', function() {
      // Hide the overlay and its content
      const overlay = this.querySelector('.book-info');
      overlay.classList.add('d-none');
    });
  });

