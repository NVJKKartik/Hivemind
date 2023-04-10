function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
  }
  
  /* Set the width of the side navigation to 0 */
  function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
  }
  
  function myFunction(x) {
      x.classList.toggle("change");
}


const pdfViewer = document.getElementById('pdf-viewer');
const closeBtn = pdfViewer.querySelector('.close');
const iframe = pdfViewer.querySelector('iframe');
const links = document.querySelectorAll('a[href$=".pdf"]');

links.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const href = link.getAttribute('href');
    iframe.src = href;
    pdfViewer.style.display = 'block';
  });
});

closeBtn.addEventListener('click', () => {
  pdfViewer.style.display = 'none';
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    pdfViewer.style.display = 'none';
  }
});