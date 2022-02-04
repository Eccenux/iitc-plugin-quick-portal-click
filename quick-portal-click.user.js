// ==UserScript==
// @id             iitc-plugin-quick-portal-click@3ch01c
// @name           IITC plugin: quick-portal-click
// @category       Misc
// @version        0.0.4
// @namespace      https://github.com/3ch01c/ingress-intel-total-conversion
// @description    This is an overwrite for default portal-click function which prevents unwanted zoom.
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @match          https://intel.ingress.com/*
// @grant          none
// @updateURL      https://github.com/Eccenux/iitc-plugin-quick-portal-click/raw/master/quick-portal-click.meta.js
// @downloadURL    https://github.com/Eccenux/iitc-plugin-quick-portal-click/raw/master/quick-portal-click.user.js
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

// setup plugin
var setup = function() {
	var fakeBookmarkIndex = 0;
	window.selectPortalByLatLng = function(lat, lng) {
		if(lng === undefined && lat instanceof Array) {
			lng = lat[1];
			lat = lat[0];
		} else if(lng === undefined && lat instanceof L.LatLng) {
			lng = lat.lng;
			lat = lat.lat;
		}
		for(var guid in window.portals) {
			var latlng = window.portals[guid].getLatLng();
			if(latlng.lat == lat && latlng.lng == lng) {
				renderPortalDetails(guid);
				return;
			}
		}

		// attempt to find in cache (includes link-anchors)
		var latE6, lngE6, guid;
		latE6 = lat * 1E6;
		lngE6 = lng * 1E6;
		guid = window.findPortalGuidByPositionE6(latE6, lngE6);
		if (guid) {
			console.log("selectPortalByLatLng: found guid");
			renderPortalDetails(guid);
		// add bookmark
		} else if ('bookmarks' in window.plugin) {
			console.log("selectPortalByLatLng: showing temporary bookmark ("+fakeBookmarkIndex+")");
			// params
			var latlng = L.latLng(lat, lng);
			var guid = 'fakeguid'+fakeBookmarkIndex;
			// add to layer
			window.plugin.bookmarks.addStar(guid, latlng, 'temporary bookmark for selected portal');
			// remove click event
			var star = window.plugin.bookmarks.starLayers[guid];
			star.off('spiderfiedclick');
			//
			fakeBookmarkIndex++;
		// last resort
		} else {
			if (confirm("Portal not found. Zoom to show portal?")) {
				urlPortalLL = [lat, lng];
				map.setView(urlPortalLL, 15);
			}
		}
	};
}

//PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property

if(!window.bootPlugins) window.bootPlugins = [];

window.bootPlugins.push(setup);

// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();

} // wrapper end

// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
