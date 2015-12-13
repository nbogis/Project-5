/************** Model *************/

var initialLoc = [];

//global variables for map
var app = app || {};
app.map, app.infowindow;
app.text = [];
app.markers = [];
app.prevMarker = null;
app.initArray = [];
app.initMarkers = [];

var Items = function(data) {
	this.name = ko.observable(data.name);
	this.types = ko.observable(data.types);
	this.geometry = ko.observable(data.geometry);
	this.visible = ko.observable(true);
	this.index = ko.observable(data.index);
};

/************** ViewModel *************/
var ViewModel = function() {
    var self = this;

    this.favPlaces = ko.observableArray([]);
    filter = ko.observable();

    // wiki variables
    this.title = ko.observable();
    this.article = ko.observable();

    var input,flag,place,noMatch,tmpArray=[],tmpMarkers=[];
	// register the binding using a binding handler
    ko.bindingHandlers.map= {
    	init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    	
    	// create the map
    	makeMap();

    	// find initial locations around the neighborhood
    	initLocation(self,['store','school','hospital','restaurant']);
	    
	    // start info window
		app.infowindow = new google.maps.InfoWindow();
		}
	}

	filterMarker = function(data,event) {
		if (event.keyCode == 13) {
			app.infowindow.close();
			// if no input is entered, show all locations and markers
			if (filter() == '' || filter() == 'undefined') {
				self.showAll(true);
			}
			else {
				// current locations list //
				// empty current locations list and update it through filtering
				self.favPlaces().length=0;
				
				// loop through the initial locations
				Label: for (var i = 0; i < app.initArray.length; i++) {
					// only the locations that are visible, meaning the current available ones
					if (app.initArray[i].visible() == true) {
						// if the name matches the input
						if(filter().toUpperCase() == app.initArray[i].name().toUpperCase()) {
							// add the location to the current locations list and skip to the next iteration
							self.favPlaces.push(app.initArray[i]);
							continue;
						}
						else {
							// checking the types of the initial locations
							for(var j = 0; j < app.initArray[i].types().length; j++){
								// if a type matches, add the location to the current location list and skip to the next iteration of Label loop
								if (filter().toUpperCase() == app.initArray[i].types()[j].toUpperCase()) {
									self.favPlaces.push(app.initArray[i]);
									continue Label;
								}
							}
							// This code won't be executed unless no match found
							// if the name or type don't match, set the location to invisible so it won't be reached for next filter
							app.initArray[i].visible(false);
						}
						
					}

				}
				// if no match found at all and current location list is empty, diable all locations and markers
				if (self.favPlaces().length == 0) {
					self.showAll(false);
				}

				// markers visibility // 
				// show the markers of the places their visibility is true
				for (i = 0; i < app.initArray.length; i++) {
					app.markers[i].setVisible(false);
					if(app.initArray[i].visible() == true) {
						app.markers[i].setVisible(true);
					}
				}
			}
		}
		return true;
	}

	// function to start a map with zoom of 3, centered at 19.67 and 44.15 (my home city), and with ROADMAP view
	var makeMap = function(){    
	    var myOptions = {
	        zoom: 14,
	        center: new google.maps.LatLng(33.727737,-117.991831),
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
	    var myMap = document.getElementById("map");
	    app.map = new google.maps.Map(myMap, myOptions);
	};

	// register initial locations and save them in initialLoc.
	// Consider stores, parks, and restaurants 
	var initLocation = function(self,types) {
		// clearMarks();
		var request = {
			location: new google.maps.LatLng(33.727737,-117.991831),
			radius: '2000',
			types: [types]
		};
		var search = new google.maps.places.PlacesService(app.map);
		search.nearbySearch(request, callback);

		function callback(results, status) {
			// var marker;
			var ind = -1;
			// callback when the search succeeded
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				// set the icons for markers
				app.icon = {
				    url: "icon.png", // image url
					    scaledSize: new google.maps.Size(40, 40), // scaled icon size
					};
				for (var i = 0; i < results.length; i++) {
				  // show all markers
				  createMarker(results[i]);
				  initialLoc.push(results[i]);
				}
				initialLoc.forEach(function(loc) {
					// loc.marker = marker;
					loc.index = ++ind;
			    	self.favPlaces.push(new Items(loc));
			    	app.initArray.push(new Items(loc));
			    })
			}
			// if the search failed
			else{
				console.log('no search available');
			}
		}

	};
	var createMarker = function(place) {
		var location = place.geometry.location;

	    var marker = new google.maps.Marker({
	        map: app.map,
	        animation: google.maps.Animation.DROP,
	        position: location,
	        icon: app.icon
	    });
	    // console.log(marker);

	    // run event when a marker is clicked
	    google.maps.event.addListener(marker, 'click', function() {    	    	
	    	if (app.prevMarker) {
		    	// stop previous marker from bouncing
				app.prevMarker.setAnimation(null);
			}
	    	// set the info window to have info about the clicked place
			// add animation to markers when they are clicked
			if (marker.getAnimation() !== null) {
				marker.setAnimation(null);
			} 
			else {	    	
				// bounce current marker
				marker.setAnimation(google.maps.Animation.BOUNCE);
			}
			// show infowindow including the place name and address
			var text = '<div><strong>'+place.name +'</strong><br>'+place.vicinity+'</div>';
			app.infowindow.setContent(text);
			app.infowindow.open(app.map, this);
			app.prevMarker = marker;

			wikiRequest(place);
		});
		app.markers.push(marker);
		app.markers[app.markers.length-1].setVisible(true);
	};
	// show of hide all locations and marker
	self.showAll = function(showOrNot) {
		filter('');
		// show or hide all locations in hte list
		if (showOrNot == true) {
			viewModel.favPlaces(app.initArray.slice(0));
		}
		else {
			viewModel.favPlaces('');
		}
		showAllMarkers(showOrNot);
		if (app.prevMarker != null) {
			app.prevMarker.setAnimation(null);
		}
		if (app.infowindow != undefined) {
			app.infowindow.close();
		}
	};

	var showAllMarkers = function(showOrNot) {
		// show or hide all markers
		for (var i = 0; i < app.initArray.length; i++) {
			// app.markers.push(app.initMarkers[i]);
			app.initArray[i].visible(showOrNot);
			app.markers[i].setVisible(showOrNot);
		}
	};

	this.clickPlace = function(clickedPlace) {
		var ind = clickedPlace.index();
		if (app.prevMarker) {
	    	// stop previous marker from bouncing
			app.prevMarker.setAnimation(null);
		}
    	// set the info window to have info about the clicked place
		// add animation to markers when they are clicked
		if (app.markers[ind].getAnimation() !== null) {
			app.markers[ind].setAnimation(null);
		} 
		else {	    	
			// bounce current marker
			app.markers[ind].setAnimation(google.maps.Animation.BOUNCE);
		}
		var text = '<div><strong>'+clickedPlace.name() +'</strong><br>'+clickedPlace.types()+'</div>';
		app.infowindow.setContent(text);
		app.infowindow.open(app.map, app.markers[ind]);
		app.prevMarker = app.markers[ind];
	};

	// handle wiki requests for searchbox searches 
	var wikiRequest = function(place) {
		// wiki request 
	    URL = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + place.name + 
	        "&format=json&callback=wikiCallback";
	    // set timeout to handle error of waiting too long for resources. wait for 8 seconds then throw error
	    var wikiRequestTimeout = setTimeout(function() {
	        self.article("Failed to get wikipedia resources");
	    }, 8000);

	    $.ajax({
	    	url: URL,
	    	dataType: 'jsonp',
	    	success: function(data) {
	    		// data containes the reply object from wikipedia
	    		var tmp = data[1];
	    		// it seems undefined URL are still successful
	    		// tmp[0] containes the title of the article. If there is no title, then the URL doesn't exist 
	    		if (tmp[0] == undefined) {
	    			document.getElementById('wiki').style.visibility = 'visible';
	    			self.title('');
	    			// output a message for no existing article
	    			self.article("Sorry this place has no wikipedia article.");
	    		}
	    		else {
	    			console.log("success");
		    		document.getElementById('wiki').style.visibility = 'visible';
		    		
		    		self.title(tmp[0]);
		    		// data[2] containes the article from wikipedia
		    		self.article(data[2]);
		    		// data[3] containes the link to the article
		    		tmp = data[3];
		    		$('#wikiTitle').attr('href',tmp[0]);
	    		}
		        //clear the timeout to stop timout from happening 
		    	clearTimeout(wikiRequestTimeout);
		    },
		    error: function(data) {
		    	console.log('bad wiki URL');
		    }
		});
	};

};


function mapSuccess() { 
	// check if google variable exist meaning google map is ready. 
	// if it is start the view model and the app
	if (typeof google !== 'undefined') {
		viewModel = new ViewModel();
		ko.applyBindings(viewModel);
	}
}

// fall back function called when the map fails to load
var mapError = function() {
	alert('Error loading Google map. Please check your connection and reload the page');
};