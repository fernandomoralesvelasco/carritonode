// console.log(document);

document.addEventListener("DOMContentLoaded", function(){
    // alert("HOLA MUNDO");
    document.getElementById("menu-icon")
    .addEventListener("click", function(){
        document.getElementById("nav-list").classList.toggle("active");
    })
})