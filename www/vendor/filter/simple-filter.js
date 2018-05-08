        

//
//Marker.init($scope.map)
//
////Один метод, который использует меньше математики/теории, состоит в выборке 2, 5, 7 или 10 точек данных за раз и определяет те, которые являются выбросами. Менее точная мера выброса, чем фильтр Калмана, заключается в использовании следующего алгоритма, чтобы взять все пара-мудрые расстояния между точками и выбросить тот, который наиболее далек от других. Обычно эти значения заменяются значением, самым близким к исходному значению, которое вы заменяете
////Например
////Сглаживание в пяти точках выборки A, B, C, D, E
////ATOTAL = СУМ расстояний AB AC AD AE
////BTOTAL = СУММ расстояний AB BC BD BE
////CTOTAL = СУМ расстояний AC BC CD CE
////DTOTAL = СУМ расстояний DA DB DC DE
////ETOTAL = СУМ расстояний EA EB EC DE
////Если BTOTAL является самым большим, вы замените точку B на D, если BD = min {AB, BC, BD, BE}
////Это сглаживание определяет выбросы и может быть увеличено с использованием средней точки BD вместо точки D, чтобы сгладить позиционную линию. Ваш пробег может варьироваться, и существуют более математически строгие решения.
///**
// * 
// * @param {Array} data
// * @param {type} _
// * @return {Array}
// */
//function smooth (data, n) {
//    var n = n || 5;
//    var filtered = angular.copy(data);
//    //var named = ['A', 'B', 'C', 'D', 'E']
//
//    for (var i = 0; i <= data.length-1; i++)
//    {
//        if (i < n) {
//            //filtered.push(data[i])
//        } else {
//
//            var wnd = data.slice(i - n, i);
//
//            for (var j in wnd) {
//                var v = 0, res = [];
//                //console.info(named[j] + 'total= ');
//
//                for (var k in wnd) {
//                    if (j != k) {
//                        v += haversine_distance(wnd[j][0], wnd[j][1], wnd[k][0], wnd[k][1]);
//                        //console.info(named[j]+named[k] + ' + ');
//                    }
//                }
//                res.push({i:((i - n) + +j),v:v});
//            }
//
//            res.sort(function(A,B){
//                return B.v - A.v;
//            });
//
//            if (res[0].i == 0) {
//                //filtered.push(data[0]);
//            } else {
//
//                var midPoint = google.maps.geometry.spherical.interpolate(
//                    pr = new google.maps.LatLng(data[res[0].i-1][0], data[res[0].i-1][1]), 
//                    ne = new google.maps.LatLng(data[res[0].i+1][0], data[res[0].i+1][1]), 0.5);
//
//                //var ppM = Marker.createMarker('Predicted Point!');
//                //ppM.setIcon('./img/markers/paleblue_MarkerA.png');
//                //ppM.setPosition(pr);
//                //
//                //var ppM = Marker.createMarker('Predicted Point!');
//                //ppM.setIcon('./img/markers/paleblue_MarkerA.png');
//                //ppM.setPosition(ne);
//                //
//                //var ppM = Marker.createMarker('Predicted Point!');
//                //ppM.setIcon('./img/markers/pink_MarkerA.png');
//                //ppM.setPosition(midPoint);
//                //
//                //var ppM = Marker.createMarker('Predicted Point!');
//                //ppM.setIcon('./img/markers/darkgreen_MarkerA.png');
//                //ppM.setPosition(new google.maps.LatLng(data[i][0], data[i][1]));
//
//                //filtered.push([midPoint.lat(), midPoint.lng()]);
//                filtered[res[0].i] = [midPoint.lat(), midPoint.lng()];
//            }
//        }
//    }
//
//
//    var ll = [];
//    for (var i in filtered) {
//
//        ll.push(new google.maps.LatLng(
//            filtered[i][0], filtered[i][1]
//        ));
//
//        var ppM = Marker.createMarker('Predicted Point!');
//        ppM.setIcon('./img/markers/yellow_MarkerB.png');
//        ppM.setPosition(new google.maps.LatLng(
//            filtered[i][0], filtered[i][1]
//        ));
//    }
//
//    var wp = new google.maps.Polyline({
//        map: $scope.map,
//        path: ll,
//        strokeColor: "red",
//        strokeOpacity: 0.7,
//        strokeWeight: 2
//    });
//
//}
//
//smooth ([
//    [37.803210, -122.285347],
//    [37.803738, -122.287744],
//    [37.808245, -122.286561],
//    [37.809588, -122.286105],
//    [37.809875, -122.287653],
//
//    [37.810235, -122.289261],
//    [37.810427, -122.291173],
//    [37.811697, -122.290566],
//    [37.813280, -122.290232],
//    [37.816013, -122.289201],
//    [37.816708, -122.287380],
//    [37.815485, -122.284892],
//    [37.815126, -122.283223],
//    [37.814454, -122.280643],
//    [37.814119, -122.278367]
//]);