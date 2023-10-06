window.addEventListener('scroll', function() {
    // Check if the scroll position is greater than 0
    if (window.scrollY > 0) {
        // Add the 'black' class to the 'nav' element
        document.querySelector('nav').classList.add('black');
    } else {
        // Remove the 'black' class from the 'nav' element
        document.querySelector('nav').classList.remove('black');
    }
});