document.querySelector(".bar a:nth-child(2)").addEventListener("mouseover",function(){
    document.querySelector(".line").style.left = "calc(100%/2.8)"
    // document.querySelector(".line").style.transform = "translate(-50%,0%)"
})
document.querySelector(".bar a:nth-child(2)").addEventListener("mouseleave",function(){
    document.querySelector(".line").style.left = "calc(100%/8)"
    // document.querySelector(".line").style.transform = "translate(0%,0%)"
})

document.querySelector(".bar a:nth-child(3)").addEventListener("mouseover",function(){
    document.querySelector(".line").style.left = "calc(100%/1.7)"
    // document.querySelector(".line").style.transform = "translate(-50%,0%)"
})
document.querySelector(".bar a:nth-child(3)").addEventListener("mouseleave",function(){
    document.querySelector(".line").style.left = "calc(100%/8)"
    // document.querySelector(".line").style.transform = "translate(0%,0%)"
})

document.querySelector(".bar a:nth-child(4)").addEventListener("mouseover",function(){
  document.querySelector(".line").style.left = "82%"
  // document.querySelector(".line").style.transform = "translate(-50%,0%)"
})
document.querySelector(".bar a:nth-child(4)").addEventListener("mouseleave",function(){
  document.querySelector(".line").style.left = "calc(100%/8)"
  // document.querySelector(".line").style.transform = "translate(0%,0%)"
})
document.querySelectorAll(".box").forEach(function(elem){
  elem.childNodes[1].addEventListener("click",function(){
    elem.childNodes[5].children[0].click()
  })
  elem.childNodes[3].addEventListener("click",function(){
    elem.childNodes[5].children[0].click()
  })

})

document.querySelector(".sec3").addEventListener("click",function(){
document.querySelector("#upload").style.display = "flex"
document.querySelector("#main").style.overflow = "hidden"
})
// document.querySelector(".sec3").addEventListener("click",function(){
//   document.querySelector("#upload").style.display = "flex"
//   })
  document.querySelector("#cross").addEventListener("click",function(){
    document.querySelector("#upload").style.display = "none"
document.querySelector("#main").style.overflow = "unset"

    })  


    document.querySelector("#add").addEventListener("click",function(){
      document.querySelector("#upload").style.display = "flex"
      document.querySelector("#main").style.overflow = "hidden"
      })