$(document).ready(function() {
    var item, tile, author, publisher, bookLink, bookImg;
    var outputList = document.getElementById("list-output");
    var bookUrl = "https://www.googleapis.com/books/v1/volumes?q=";
    var apiKey = "key=AIzaSyDtXC7kb6a7xKJdm_Le6_BYoY5biz6s8Lw";
    var placeHldr = '<img src="https://via.placeholder.com/150">';
    var searchData;
  

    $("#search").click(function() {
      outputList.innerHTML = ""; 
      document.body.style.backgroundImage = "url('')";
       searchData = $("#search-box").val();
       if(searchData === "" || searchData === null) {
         displayError();
       }
      else {

         $.ajax({
            url: bookUrl + searchData,
            dataType: "json",
            success: function(response) {
              console.log(response)
              if (response.totalItems === 0) {
                alert("no result!.. try again")
              }
              else {
                $("#title").animate({'margin-top': '5px'}, 1000); //search box animation
                $(".book-list").css("visibility", "visible");
                displayResults(response);
              }
            },
            error: function () {
              alert("Something went wrong.. <br>"+"Try again!");
            }
          });
        }
        $("#search-box").val(""); 
     });
  
     function displayResults(response) {
        for (var i = 0; i < response.items.length; i+=2) {
          item = response.items[i];
          title1 = item.volumeInfo.title;
          author1 = item.volumeInfo.authors;
          publisher1 = item.volumeInfo.publisher;
          bookLink1 = item.volumeInfo.previewLink;
          bookIsbn = item.volumeInfo.industryIdentifiers[1].identifier
          bookImg1 = (item.volumeInfo.imageLinks) ? item.volumeInfo.imageLinks.thumbnail : placeHldr ;
  
          item2 = response.items[i+1];
          title2 = item2.volumeInfo.title;
          author2 = item2.volumeInfo.authors;
          publisher2 = item2.volumeInfo.publisher;
          bookLink2 = item2.volumeInfo.previewLink;
          bookIsbn2 = item2.volumeInfo.industryIdentifiers[1].identifier
          bookImg2 = (item2.volumeInfo.imageLinks) ? item2.volumeInfo.imageLinks.thumbnail : placeHldr ;
  
          outputList.innerHTML += '<div class="row mt-4">' +
                                  formatOutput(bookImg1, title1, author1, publisher1, bookLink1, bookIsbn) +
                                  formatOutput(bookImg2, title2, author2, publisher2, bookLink2, bookIsbn2) +
                                  '</div>';
  
          console.log(outputList);
        }
     }

     function formatOutput(bookImg, title, author, publisher, bookLink, bookIsbn) {

       var viewUrl = 'book?isbn='+bookIsbn; 
       var htmlCard = `<div class="col-lg-6">
         <div class="card" style="">
           <div class="row no-gutters">
             <div class="col-md-4">
               <img src="${bookImg}" class="card-img" alt="...">
             </div>
             <div class="col-md-8">
               <div class="card-body">
                 <h5 class="card-title">${title}</h5>
                 <p class="card-text">Author: ${author}</p>
                 <p class="card-text">Publisher: ${publisher}</p>
                 <a target="_blank" href="${viewUrl}" class="btn btn-secondary" action = "Post">Read Book</a>
               </div>
             </div>
           </div>
         </div>
       </div>`
       return htmlCard;
     }
  
     function displayError() {
       alert("search term can not be empty!")
     }
  
  });
      // Get the search box input and search button elements
      const searchBox = document.getElementById('search-box');
      const searchButton = document.getElementById('search');
      
      // Add a keyup event listener to the search box input
      searchBox.addEventListener('keyup', function(event) {
        // Check if the Enter key was pressed
        if (event.keyCode === 13) {
          // Trigger a click event on the search button
          searchButton.click();
        }
      });
    