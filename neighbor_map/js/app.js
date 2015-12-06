/************** Model *************/

var initialLoc = [];

//global variables for map
var app = app || {};
app.map, app.infowindow;
app.text = [];
app.markers = [];
app.prevMarker = null;
app.initArray = [];
// app.initMarkers = [];

var Items = function(data) {
	this.name = ko.observable(data.name);
	this.types = ko.observable(data.types);
	this.geometry = ko.observable(data.geometry);
};

/************** ViewModel *************/
var ViewModel = function() {
    var self = this;

    this.favPlaces = ko.observableArray([]);
    filter = ko.observable();

    var input,flag,place,noMatch,tmpArray=[];
	// register the binding using a binding handler
    ko.bindingHandlers.map= {
    	init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    	
    	// create the map
    	makeMap();

    	// find initial locations around the neighborhood
    	initLocation(self,['store','gas startion','restaurant']);
	    
	    // start info window
		app.infowindow = new google.maps.InfoWindow();
		},
		update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			// initLocation(self,filter);
		}
	}

	filterMarker = function(data,event) {
		if (event.keyCode == 13) {
			console.log(self.favPlaces().length);
			tmpArray = self.favPlaces().slice(0);
			showAllMarkers(false);
			// show all locations when no input
			if (filter() == '' || filter() == 'undefined') {
				showAll(true);
			}
			// when an input is entered
			else {
				// empty favPlaces list to add the matching locations when a match is found
				self.favPlaces().length=0;
				for(var i = 0; i < tmpArray.length; i++) {
					// check if the input matching the name of any of the inital locations
					// add the location to favPlaces to populate to the list
					// and show the corrisponding marker
					if(filter().toUpperCase() == tmpArray[i].name().toUpperCase()) {
						self.favPlaces.push(tmpArray[i]);
						app.markers[i].setVisible(true);
						continue;
					}
					else {
						for(var j = 0; j < tmpArray[i].types().length; j++){
							if (filter().toUpperCase() == tmpArray[i].types()[j].toUpperCase()) {
								self.favPlaces.push(tmpArray[i]);
								app.markers[i].setVisible(true);
								break;
							}
						}
					}
				}
				if (self.favPlaces().length == 0) {
					showAll(false);
				}
			}
		}
		return true;
		
	}
	var markerPlaces = function(n) {
	// if filter() doesn't have a match
		if (noMatch == true) {
			// console.log(self.favPlaces()[n].name() + 'is no match');
			// console.log('name ' + self.favPlaces()[n].name());
			// console.log('remove '+ self.favPlaces()[n].name());
			self.favPlaces.splice(n,1);
			app.markers[n].setVisible(false);
			app.markers.splice(n,1);
		}
		else {
			// if match is found
			// console.log(self.favPlaces()[n].name() + 'is a match');
			// self.favPlaces().splice(n,1);
			app.markers[n].setVisible(true);
		}
	}
};

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
	clearMarks();
	console.log('types '+ types);
	var request = {
		location: new google.maps.LatLng(33.727737,-117.991831),
		radius: '1000',
		types: [types]
	};
	var search = new google.maps.places.PlacesService(app.map);
	search.nearbySearch(request, callback);

	function callback(results, status) {
		// callback when the search succeeded
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			// set the icons for markers
			app.icon = [{
			    url: "icon.png", // image url
				    scaledSize: new google.maps.Size(40, 40), // scaled icon size
				},
				{
					url: "icon2.png", // image for initila locations
				    scaledSize: new google.maps.Size(40, 40), 
				}
			];
			for (var i = 0; i < results.length; i++) {
			  // show all markers
			  createMarker(results[i],app.icon[0]);
			  initialLoc.push(results[i]);
			}

			initialLoc.forEach(function(loc) {
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

var createMarker = function(place,icon) {
	var location = place.geometry.location;

    var marker = new google.maps.Marker({
        map: app.map,
        animation: google.maps.Animation.DROP,
        position: location,
        icon: icon
    });

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
		// show infowindow
		var text = '<div><strong>'+place.name +'</strong><br>'+place.types+'</div>';
		app.infowindow.setContent(text);
		app.infowindow.open(app.map, this);
		app.prevMarker = marker;
	});
	app.markers.push(marker);
	// app.initMarkers = app.markers.slice(0);
	
}

// function to clear all markers
var clearMarks = function(){
	// if there are at least one marker, set it to null to not show
	if (app.markers.length > 0){
    	for (var i = 0; i < app.markers.length; i++){
			app.markers[i].setMap(null); // Hide the markers
		}
	// delete the markers
	app.markers = []; 
	}
}

// show of hide all locations and marker
var showAll = function(showOrNot) {
	filter('');
	// show or hide all locations in hte list
	if (showOrNot == true) {
		viewModel.favPlaces(app.initArray.slice(0));
	}
	else {
		viewModel.favPlaces('');
	}
	showAllMarkers(showOrNot);
}

var showAllMarkers = function(showOrNot) {
	// show or hide all markers
	for (var i = 0; i < app.markers.length; i++) {
		app.markers[i].setVisible(showOrNot);
		// if (showOrNot == false) {
		// 	app.markers.slice(i,1);	
		// }
	}
}

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