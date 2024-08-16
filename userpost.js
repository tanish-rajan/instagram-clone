document.querySelector(".bar a:nth-child(1)").addEventListener("mouseover",function(){
    document.querySelector(".line").style.left = "calc(100%/8)"
    // document.querySelector(".line").style.transform = "translate(-50%,0%)"
})
document.querySelector(".bar a:nth-child(1)").addEventListener("mouseleave",function(){
    document.querySelector(".line").style.left = "calc(100%/2.8)"
    // document.querySelector(".line").style.transform = "translate(0%,0%)"
})

document.querySelector(".bar a:nth-child(3)").addEventListener("mouseover",function(){
    document.querySelector(".line").style.left = "calc(100%/1.7)"
    // document.querySelector(".line").style.transform = "translate(-50%,0%)"
})
document.querySelector(".bar a:nth-child(3)").addEventListener("mouseleave",function(){
    document.querySelector(".line").style.left = "calc(100%/2.8)"
    // document.querySelector(".line").style.transform = "translate(0%,0%)"
})

document.querySelector(".bar a:nth-child(4)").addEventListener("mouseover",function(){
  document.querySelector(".line").style.left = "82%"
  // document.querySelector(".line").style.transform = "translate(-50%,0%)"
})
document.querySelector(".bar a:nth-child(4)").addEventListener("mouseleave",function(){
  document.querySelector(".line").style.left = "calc(100%/2.8)"
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
})
document.querySelector(".sec3").addEventListener("click",function(){
  document.querySelector("#upload").style.display = "flex"
  })
  document.querySelector("#cross").addEventListener("click",function(){
    document.querySelector("#upload").style.display = "none"
    })  

    function cmt(){
        var flag =0
    document.querySelectorAll(".post").forEach(function(elem){
        console.log(elem.children[2].children[0].children[2])
        console.log(elem.children[5])
        console.dir(elem)
        console.dir(elem.children[2].children[0].children[1])
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

    document.addEventListener("DOMContentLoaded", function(event) { 
      var scrollpos = localStorage.getItem('scrollpos');
      if (scrollpos) window.scrollTo(0, scrollpos);
  });

  window.onbeforeunload = function(e) {
      localStorage.setItem('scrollpos', window.scrollY);
  };
  
  document.querySelector("#add").addEventListener("click",function(){
    document.querySelector("#upload").style.display = "flex"
    document.querySelector("#main").style.overflow = "hidden"
    })