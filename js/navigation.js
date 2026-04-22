
window.addEventListener('DOMContentLoaded', navigator, false);
window.addEventListener('hashchange', navigator, false);



function navigator () {
    if (location.hash.startsWith('#home')) {
        homePage();
    } else if (location.hash.startsWith('#cities')) {
        citiesPage();

    }
}


const homePage = () => {
   banner.classList.remove('hidden');
   grid.classList.add("hidden");
  
}


const citiesPage = () => {
    banner.classList.add("hidden");
   grid.classList.remove("hidden");

}

