

                   var latitudeArr = [];
                    var longitudeArr = [];
                    var start_end_markersList = [];
                    var map;
                    var pth=window.location.href;/*get path of image folder*/
                    var full_path = pth.replace(pth.substr(pth.lastIndexOf('/') + 1), '');

                    /*put your REST API URL with key here**/
                    var dist_api_url="https://apis.mapmyindia.com/advancedmaps/v1/your_rest_key_here/distance?";
                    window.onload = function(){
                    var centre = new L.LatLng(22.268764, 82.390136);
                    map=new MapmyIndia.Map('map-container',{center:centre,zoomControl: true,hybrid:true });
                     /*1.create a MapmyIndia Map by simply calling new MapmyIndia.Map() and passsing it at the minimum div object, all others are optional...
                      2.all leaflet mapping functions can be called simply on the L object
                      3.MapmyIndia may extend and in future modify the customised/forked Leaflet object to enhance mapping functionality for developers, which will be clearly documented in the MapmyIndia API documentation section.*/

                    call_distance_api();/***call distance api***********/

                };
                    function call_distance_api()
                    {
                        remove_start_end_markersList();
                        /***************get parameters*************************/
                        var center_points = document.getElementById('center').value;
                        var pts = "";
                        for (var i = 1; i <= 5; i++)
                        {
                            var val = document.getElementById(i).value;
                            show_markers(i, val.split(","));
                            if (pts == '')
                                pts = val;
                            else
                                pts += "|" + val;
                        }
                        document.getElementById('result').innerHTML = "loading..";
                        var traffic = document.getElementById('traffic').value;
                        var dist_api_url_with_param = dist_api_url +"center=" + center_points + "&pts=" + pts + "&with_traffic="+traffic;
                     
                        getUrlResult(dist_api_url_with_param);/*get JSON result from the API*/
                        show_markers("center", center_points.split(","));/*show marker*/
                        mapmyindia_fit_markers_into_bound();
                    }

                    var result = "";
                    /*function to get Json response from the url*/
                    function getUrlResult(api_url) {
                        $.ajax({
                            type: "POST",
                            dataType: 'text',
                            url: "getResponse.php",
                            async: false,
                            data: {
                                url: JSON.stringify(api_url),
                            },
                            success: function (result) {
                            var resdata = JSON.parse(result);

                            if (resdata.status=='success'){
                            var jsondata = JSON.parse(resdata.data);
                            if (jsondata.responseCode == 200) {
                                        distance_api_result(jsondata.results);
                                }
                                else{
                                    var res='Something went wrong in the response';
                                    document.getElementById('result').innerHTML = res;
                                    
                                }
                            }
                             else{
                            var error_response="No Response from API Server. kindly check the keys or request server url"
                            document.getElementById('result').innerHTML = error_response + '</ul></div>';/***put response result in div****/
                            }

                            }
                        });
                    }

                    /*function to distance api result*/
                    function distance_api_result(data)
                    {
                        var num = 1;
                        var result = "<br><span style='font-size:12px'>Showing distance & duration from center point</span><br><br>";
                        for (var i=0; i<data.length;i++){
                            item=data[i];
                            var duration = item.duration;
                            /*****convert hrs & min********/
                            var hours = Math.floor(duration / 3600);
                            duration %= 3600;
                            var minutes = Math.floor(duration / 60);
                            var total_time = (hours >= 1 ? hours + " hrs " : '') + (minutes >= 1 ? minutes + " mins " : '');
                            /**************/
                            var length = (item.length / 1000).toFixed(1) + " km";
                            result += "<div style='padding:5px 0 2px 0px;color:#222;font-size:13px'>Marker " + num + "</div>";
                            result += "<div><span style='padding-right:18px'>Duration</span>: " + total_time + "</div>";
                            result += "<div ><span style='padding-right:18px'>Distance</span>: " + length + "</div>";
                            result += "<div style='border-bottom: 1px solid #e9e9e9;padding-bottom:10px'><span style='padding-right:5px'>Wgs Points</span>: " + document.getElementById(num++).value + "</div>";
                    }
                        document.getElementById('result').innerHTML = result;
                    }
                    
                    /*fucntion to show markers*/
                    function show_markers(marker_name, points)
                    {
                        var show_marker = [];
                        var pos = new L.LatLng(points[0], points[1]);
                        latitudeArr.push(points[0]);
                        longitudeArr.push(points[1]); /****push value for bound the marker********/
                        var icon_marker='';
                        var title;
                        
                        if (marker_name == 'center') {
                            var icon_marker = L.icon({iconUrl: full_path + '/images/3.png', iconRetinaUrl: full_path + '/images/3.png', iconSize: [32, 40], popupAnchor: [-3, -15]});
                            title = "center";
                        } else {
                            title = "Marker" + marker_name;
                        }
                        /****marker display, for more about marker, please refer our marker documentation****/
                        if (icon_marker!=''){
                        show_marker[marker_name] = new L.marker(pos, {draggable: 'true',icon:icon_marker, title: title}).addTo(map);
                        }
                        else{
                         show_marker[marker_name] = new L.marker(pos, {draggable: 'true',title: title}).addTo(map);

                        }

                        show_marker[marker_name].bindPopup("<div style=\"font-size:12px;font-weight:bold;\">"+title+"</div>", {closeButton: true, autopan: true, zoomAnimation: true}).openPopup();
                        show_marker[marker_name].on('dragend', function (event) {
                        var marker = event.target;
                        var point = marker.getLatLng();
                        document.getElementById(marker_name).value = point.lat.toFixed(6) + "," + point.lng.toFixed(6);
                        call_distance_api();
                        });
                        start_end_markersList.push(show_marker[marker_name]);
                    }

                    /*remove markers from map*/
                    function remove_start_end_markersList() {
                        for (var k = 0; k < start_end_markersList.length; k++) {
                            map.removeLayer(start_end_markersList[k]);
                        }
                        start_end_markersList = new Array();
                    }
                    /*fit map within the bounds of map*/
                    function mapmyindia_fit_markers_into_bound()
                    {
                        var maxlat = Math.max.apply(null, latitudeArr);
                        var maxlon = Math.max.apply(null, longitudeArr);
                        var minlat = Math.min.apply(null, latitudeArr);
                        var minlon = Math.min.apply(null, longitudeArr);
                        var southWest = L.latLng(maxlat, maxlon);
                        var northEast = L.latLng(minlat, minlon);
                        var bounds = L.latLngBounds(southWest, northEast);
                        map.fitBounds(bounds);
                    }




/*******************************************************/