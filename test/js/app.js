/************** Model *************/
// format of the locations match google maps locations
var initialLoc = [
	{
		name: 'Kaaba',
		geometry: {
			location: {
				lat: 21.422470,
				lng: 39.826207
			}
		},
		tweet: {
			href: "https://twitter.com/hashtag/kaaba",
			widgetID: "666393352770686977"
		}
		
	},
	{
		name: 'Hira Cave',
		geometry: {
			location: {
			lat: 21.457357,
			lng: 39.858936
			}
		},
		tweet: {
			href: "https://twitter.com/search?q=%23Hira%20Cave",
			widgetID: "666323386847490049"
		}
	},
	{
		name: 'Mecca',
		geometry: {
			location: {
				lat: 21.389082,
				lng: 39.857912
			}
		},
		tweet: {
			href: "https://twitter.com/hashtag/makkah",
			widgetID: "666360757890777090"
		}
	},
	{
		name: 'Jeddah',
		geometry: {
			location: {
				lat: 21.285407,
				lng: 39.237551
			}
		},
		tweet: {
			href: "https://twitter.com/hashtag/jeddah",
			widgetID: "666394128276566016"
		}
	},
	{
		name: 'Ash-Shafa',
		geometry: {
			location: {
				lat: 21.074424,
				lng: 40.324176
			}
		},
		tweet: {
			href: "https://twitter.com/hashtag/Taif",
			widgetID: "666394807749611521"
		}
	}
];


var Items = function(data) {
	this.name = ko.observable(data.name);
	this.geometry = ko.observable(data.geometry.location);
	this.tweet = ko.observable(data.tweet);
};

//global variables for map
var app = app || {};
app.map, app.infowindow;
app.text = [];
app.markers = [];
app.icon = [{
    url: "icon.png", // image url
	    scaledSize: new google.maps.Size(40, 40), // scaled icon size
	},
	{
		url: "icon2.png", // image for initila locations
	    scaledSize: new google.maps.Size(40, 40), 
	}
];

/************** ViewModel *************/
var ViewModel = function() {
    var self = this;

    // add the initial locations to the list
    this.favPlaces = ko.observableArray([]);
    initialLoc.forEach(function(loc) {
    	self.favPlaces.push(new Items(loc));
    })

    this.title = ko.observable();
    this.article = ko.observable();

    // start the elements of the custom bind with deafulats values

    // register the binding using a binding handler
    ko.bindingHandlers.map= {
    	init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
	    	// start a map at a pre-defined location
	    	makeMap();

	  		// start info window
			app.infowindow = new google.maps.InfoWindow();
		},
    	update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			var input = document.getElementById('mySearch');

			var options = {
			  bounds: app.map.getBounds(),
			};

			// add searchBox to extend prediction since autocomplete is very strict
			var searchBox = new google.maps.places.SearchBox(input);

			// Bias the SearchBox results to the current viewport
			app.map.addListener('bounds_changed', function() {
				searchBox.setBounds(app.map.getBounds());
			});
			// Listen for the event fired when the user selects a prediction and retrieve
			  // more details for that place.
			searchBox.addListener('places_changed', function() {
				clearMarks();
				var places = searchBox.getPlaces();
				var marker;
				if (places.length > 0) {
					places.forEach(function(place) {
						marker = createMarker(place,app.icon[0]);
						app.markers.push(marker);
					})
				}
				else {
					alert('Sorry we couldn\'t find matching locations')
				}

		    });
		}
	};

	// function to start a map with zoom of 3, centered at 19.67 and 44.15 (my home city), and with ROADMAP view
	var makeMap = function(){    
	    var myOptions = {
	        zoom: 8,
	        center: new google.maps.LatLng(21.074424,40.324176),
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
	    var myMap = document.getElementById("map");
	    app.map = new google.maps.Map(myMap, myOptions);
	};

	this.showInitLoc = function(clickedLoc) {
		// createMarker(clickedLoc,app.icon[1]);
		var location = clickedLoc.geometry();
	    var marker = new google.maps.Marker({
	        map: app.map,
	        animation: google.maps.Animation.DROP,
	        position: location,
	        icon: app.icon[1]
	    });
	    app.markers.push(marker);
	    // event listener to control what happen when a marker is clicked
		google.maps.event.addListener(marker, 'click', function() {
			// add animation to markers when they are clicked and not animated
			if (marker.getAnimation() !== null) {
				marker.setAnimation(null);
			} else {
				marker.setAnimation(google.maps.Animation.BOUNCE);
			}
			// show infowindow with wiki links
			showInfoWiki(clickedLoc);

			// open the map with the info window
			app.infowindow.open(app.map, this);
			showTweets(clickedLoc);

		});
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
	    	// set the info window to have info about the clicked place
			// add animation to markers when they are clicked
			if (marker.getAnimation() !== null) {
				marker.setAnimation(null);
			} else {
				marker.setAnimation(google.maps.Animation.BOUNCE);
			}
			// show infowindow
			var text = '<div><strong>'+place.name;
			if (place.formatted_address) {
				text = text + '</strong><br>'+place.formatted_address;
			}
			if (place.opening_hours){
				text = text + '<br>'+place.opening_hours;
			}
			else {
				text = text + '<br>no hours of operation registered';	
			}
			
		    app.infowindow.setContent(text);
		    // open the map with the info window
		    app.infowindow.open(app.map, this);
		    wikiRequest(place,self);
		    
		});
		return marker;
	};
};

// handle wiki requests for inital locations 
var showInfoWiki = function(place) {
	// do a wiki search for articles
	URL = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + place.name() + 
            "&format=json&callback=wikiCallback";
    // set timeout to handle error of waiting too long for resources. wait for 8 seconds then throw error
    var wikiRequestTimeout = setTimeout(function() {
        app.infowindow.setContent("Failed to get wikipedia resources");
    }, 8000);

    $.ajax({
    	url: URL,
    	dataType: 'jsonp',
    	success: function(data) {
    		// data[1] has array of all article titles
    		// data[3] has array of the links to the articles which we need to direct user to 
    		var articleTitles = data[1];
    		var artLink = data[3];
    		// we are interested in one article to open. I will pick the first one and show it
    		// the name will show up as a link and a new tab will open when the link is pressed
    		var text = '<div><a href="' + artLink[0] + '" target="_blank">' + articleTitles[0] + '</a>';
			app.infowindow.setContent(text);
	        // clear the timeout to stop timout from happening 
	    	clearTimeout(wikiRequestTimeout);
	    }
    })
}

// handle wiki requests for searchbox searches 
var wikiRequest = function(place,self) {
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
	    	console.log(URL);
	    	console.log("success");
    		document.getElementById('wiki').style.visibility = 'visible';
    		var tmp = data[1];
    		self.title(tmp[0]);
    		self.article(data[2]);
    		tmp = data[3];
    		$('#wikiTitle').attr('href',tmp[0]);
	        //clear the timeout to stop timout from happening 
	    	clearTimeout(wikiRequestTimeout);
	    }
	});
};

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

// function to add the twitter widgets that was initially created by me. The widgets work only
// for the initial locations 
var showTweets = function(placeTweets) {
	if (document.getElementsByTagName("iframe").length !=0) {
		$("#tweet").remove();
		$("#mapTweet").find("iframe").remove();
		$("#mapTweet").find("script").remove();
		$("#mapTweet").find("script").remove();
	}
	else{
		window.twttr = (function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0],
			t = window.twttr || {};
			if (d.getElementById(id)) return;
			js = d.createElement(s);
			js.id = id;
			js.src = "https://platform.twitter.com/widgets.js";
			fjs.parentNode.insertBefore(js, fjs);
			t._e = [];
			t.ready = function(f) {
			t._e.push(f);
		};

		return t;
		}(document, "script", "twitter-wjs"));

		var twitter = document.getElementById('twitter');
		var href = placeTweets.tweet().href;
		var number = placeTweets.tweet().widgetID;

		// create an "a" tag that include the page and the widget id
		var text = '<a id="tweet" class="twitter-timeline" href="'+ href + '" data-widget-id="'+
		number + '">#'+ placeTweets.name() + ' Tweets</a>';
		// $(text).insertAfter("#mapTweet");
		$("#mapTweet").append(text);

		// insert a script function to handle the tweets
		text = '<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?' +
		"'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"+
		'"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>';
		
		$(text).insertAfter("#tweet");
	}
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);

