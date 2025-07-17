const maxbtn = document.getElementById('maxbtn');
const minbtn = document.getElementById('minbtn');
const header = document.querySelector('.header');
const content = document.querySelector('.content');

maxbtn.addEventListener('click', () => {
    maxbtn.classList.add('hidden');
    header.classList.remove('hidden');
    content.classList.remove('hidden');
});

minbtn.addEventListener('click', () => {
    maxbtn.classList.remove('hidden');
    header.classList.add('hidden');
    content.classList.add('hidden');
});