
function like(){
    var flag = 0
    document.querySelectorAll(".post").forEach(function(elem){
        elem.children[1].addEventListener("dblclick",function(){
            elem.children[2].children[0].children[0].style.display = "block"
            // flag = 1
        })
        })

}
like()

function cmt(){
    var flag =0
document.querySelectorAll(".post").forEach(function(elem){
    elem.children[2].children[0].children[1].addEventListener("click",function(){
        if(flag===0){

            elem.children[5].style.display = "flex"
            flag=1
        }
        else{
            elem.children[5].style.display = "none"
            flag=0
        }

})
})
}
cmt()

// var flag = 0
// document.querySelectorAll("#f").forEach(function(elem){
//     elem.addEventListener("dblclick",function(){
//         if(flag === 0){
//             gsap.to(elem.childNodes[1],{
//                 display:"block",
//                 duration:1,
//                 ease:Expo.easeInOut,
    
//                 // transform: `translate(-50%,-50%) scale(1)`
//             })
//             document.querySelector("#heart").click()
//             // elem.childNodes[1].style.display = "block"
//             setTimeout(() => {
//                 gsap.to(elem.childNodes[1],{
//                     display:"none",
//                     duration:1,
//                     ease:Expo.easeInOut,
         
                    
//                 })
//             }, 100);
//             flag = 1
//         }
//         else{
//             document.querySelector("")
//         }
      
//     })
//     })4

// document.documentElement.style.setProperty('--white', 'hsl(252deg 29.41% 10%)');
// document.documentElement.style.setProperty('--light', 'hsl(0deg 0% 0%)');
// document.documentElement.style.setProperty('--black', 'white');
// document.documentElement.style.setProperty('--blue', 'hsl(251.76deg 75.37% 60.2%)');
