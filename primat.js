var Primats = (function() {
    var myleaves = [];
    var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1rTL6r7exf_0SzZifpeW4532ggYn8KukEu1fzEKEex9s/edit?usp=sharing'
    var screenWidth;

    var init = function() {
        Tabletop.init({
            key: publicSpreadsheetUrl,
            callback: showInfo,
            debug: false,
            wanted: ["Data"],
            simpleSheet: true
        })
    }

    var showInfo=function(data, tabletop) {
        //alert('Successfully processed!')
        //console.log(data);
        var data = data.map(processData);

        drawAnSVG()
        drawAnAxis()
        drawValueScaner()
        initFilter()
        findPrimers(data)
        drawHierarchy(data)
        drawConnections(data)
        readImagesTable()
    }

    /*loading from local tsv*/
    /* d3.tsv("Primat.tsv").then( function(rawdata) {
         var data = rawdata.map(processData);
         ...
     });*/

    var readImagesTable = function() {
        if (screenWidth>=1024)
        Tabletop.init({
            key: publicSpreadsheetUrl,
            callback: drawImages,
            debug: false,
            wanted: ["Images"],
            simpleSheet: true
        })
    }

    var drawImages = function(imgArr) {
        g_img = svg.append("g").attr("class", "taxon_images")
        imgArr.forEach(function (image) {

            var xImg, yImg, wImg
            xImg = x(-image.x)
            yImg = parseFloat(d3.select("rect#id" + image.id).attr("y")) + parseFloat(image.y_offset)
            wImg = x(image.width) - x(0)
            if (wImg>image.max_width) wImg=image.max_width
            if (image.visible)
                g_img.append("svg:image")
                    .attr('x', +xImg)
                    .attr('y', +yImg)
                    .attr('width', wImg)
                    .attr("xlink:href", "img/animals/" + image.url)
        })
    }

    var processData = function(d) {
        var processed = {
            id: d.id,
            mir: d.mirorder,
            order: d.order,
            suborder: d.suborder,
            hyporder: d.hyporder,
            infraorder: d.infraorder,
            parvorder: d.parvorder,
            superfamily: d.superfamily,
            family: d.family,
            subfamily: d.subfamily,
            genus: d.genus,
            location: d.location_ru,
            period_start: d.period_start,
            period_end: d.period_end,
            origin: d.origin,
            continent_id: d.continent_id
        }
        return processed;
    }

    /**TODO: make an elegant recursion**/
    var drawHierarchy = function(data) {
        ypos = 30
        delta = 0
        var myOrders = findOrders(data);
        myOrders.forEach(function (order) {
            drawEpicOrderName(order, "отряд");
            subOrders = getSubOrders(order, data)
            //console.log("suborders of ("+order+") = "+JSON.stringify(subOrders,null,2))
            subOrders.forEach(function (subOrder, o) {
                findIds(SubOrdersDataRoot[0], subOrder)
                if (subOrder) drawRect(myleaves, subOrder, "подотряд.", "subOrder", o * 10 + 6)
                hypOrders = getHypOrders(subOrder, data)
                //console.log("hypOrders of ("+order+"-"+subOrder+") = "+JSON.stringify(hypOrders,null,2))
                hypOrders.forEach(function (hypOrder, n) {
                    findIds(HypOrdersDataRoot[0], hypOrder)
                    if (hypOrder) drawRect(myleaves, hypOrder, "гипотряд.", "hypOrder", n * 100 + o * 10 + 5)
                    infraOrders = getInfraOrders(hypOrder, data)
                    //console.log("infraOrders of ("+order+"-"+subOrder+"-"+hypOrder+") = "+JSON.stringify(infraOrders,null,2))
                    infraOrders.forEach(function (infraOrder, m) {
                        findIds(infraOrdersDataRoot[0], infraOrder)
                        if (infraOrder) drawRect(myleaves, infraOrder, "инфраотряд.", "infraOrder", m * 1000 + n * 100 + o * 10 + 4)
                        parvOrders = getParvOrders(infraOrder, data)
                        parvOrders.forEach(function (parvOrder, l) {
                            findIds(parvOrdersDataRoot[0], parvOrder)
                            if (parvOrder) drawRect(myleaves, parvOrder, "парвотряд.", "parvOrder", l * 10000 + m * 1000 + n * 100 + o * 10 + 3)
                            superFamilys = getSuperFamilys(parvOrder, data)
                            superFamilys.forEach(function (superFamily, k) {
                                findIds(superFamilysDataRoot[0], superFamily)
                                if (superFamily) drawRect(myleaves, superFamily, "надсем.", "superfamily", k * 100000 + l * 10000 + m * 1000 + n * 100 + o * 10 + 2)
                                familys = getFamilys(superFamily, data)
                                familys.forEach(function (family, j) {
                                    findIds(familysDataRoot[0], family);
                                    //console.log("leaves familys ="+ JSON.stringify(myleaves))
                                    drawRect(myleaves, family, "сем.", "family", j * 1000000 + k * 100000 + l * 10000 + m * 1000 + n * 100 + o * 10 + 1);
                                    subFamilys = getSubFamilys(family, data);
                                    //console.log("subFamilys of ("+order+"-"+subOrder+"-"+hypOrder+"-"+infraOrder+"-"+parvOrder+"-"+superFamily+"-"+family+")=" +JSON.stringify(subFamilys,null,2))
                                    subFamilys.forEach(function (subFamily) {
                                        findIds(subfamilysDataRoot[0], subFamily);
                                        //console.log("leaves subfam ="+ JSON.stringify(myleaves))
                                        drawBricks(myleaves, subFamily, familys);
                                    });
                                    if (family) resizeRect(family, j * 1000000 + k * 100000 + l * 10000 + m * 1000 + n * 100 + o * 10 + 1);
                                })
                                if (superFamily) resizeRect(superFamily, k * 100000 + l * 10000 + m * 1000 + n * 100 + o * 10 + 2)
                            })
                            if (parvOrder) resizeRect(parvOrder, l * 10000 + m * 1000 + n * 100 + o * 10 + 3)
                        })
                        if (infraOrder) resizeRect(infraOrder, m * 1000 + n * 100 + o * 10 + 4)
                    })
                    if (hypOrder) resizeRect(hypOrder, n * 100 + o * 10 + 5)
                })
                if (subOrder) resizeRect(subOrder, o * 10 + 6)
            })
        })
        svg.attr("height", ypos).attr("viewBox", "0 0 " + plotWidth + " " + ypos)
        /*resize according to content*/
    }

    var findPrimers = function(data) {
        data.forEach(function (item) {
            if (item.origin) {
                parent = getParent(item.origin, data)

                if (+item.period_start > +parent.period_start) /*if we found the case of primer*/
                {
                    /*console.log("child = " + item.id)
                    console.log("parent = " + parent.id)
                    console.log("PRIMER!!!")*/

                    primer_start = +item.period_start + 1
                    /*calc new period start*/
                    parent.period_start_old = parent.period_start
                    /*fix initial period start*/
                    parent.period_start = primer_start
                    /*write new period start*/

                    findPrimers(data)
                    /*recursively find possible new cases of  primers*/

                    /*console.log("----------------")*/
                }
            }
        })
    }

    var getParent = function(parent_id, data) {
        var parent = data.find(x => x.id === parent_id)
        return parent
    }

    var drawConnections = function(data) {
        var g = svg.select("g.connections")
        data.forEach(function (d) {
            if (d.origin) {
                var brickFrom = svg.select("rect#id" + d.origin + ".brick")
                var brickTo = svg.select("rect#id" + d.id + ".brick")
                if (brickFrom.node() && brickTo.node()) {

                    /*coordinates of parent brick*/
                    var x1From = parseFloat(brickFrom.attr("x"))
                    var x2From = parseFloat(brickFrom.attr("x")) + parseFloat(brickFrom.attr("width")) - 0.5
                    var yFrom = parseFloat(brickFrom.attr("y")) + 3

                    /*coordinates of child brick*/
                    var x1To = parseFloat(brickTo.attr("x"))
                    var x2To = parseFloat(brickTo.attr("x")) + parseFloat(brickTo.attr("width"))
                    var yTo = parseFloat(brickTo.attr("y")) + 3

                    var color = brickFrom.attr("fill")
                    /*put the color from parent*/
                    var xSource = x2From
                    /*init start X coordinate of connector*/

                    if (x2From > x1To) xSource = x1From + 0.5
                    /*if end of parent younger then start of child*/

                    /*if child start time inside parent time*/
                    if (x1To > x1From && x1To < x2From)
                        if (x1To - 8 > x1From) xSource = x1To - 8
                        else xSource = x1From + 1

                    var lineGenerator = d3.line().curve(d3.curveStepBefore);

                    var points = [
                        [xSource, yFrom],
                        [x1To, yTo]
                    ];

                    var pathData = lineGenerator(points); // connections with corners

                    var data1 = [{ //connections with curves
                        source: {
                            x: yFrom,
                            y: xSource
                        },
                        target: {
                            x: yTo,
                            y: x1To
                        }
                    },];

                    var link = d3.linkHorizontal()
                        .x(function (d) {
                            return d.y;
                        })
                        .y(function (d) {
                            return d.x;
                        });

                    g.append('path').attr('d', pathData).attr("stroke", color);
                    /* step connections*/
                    //g.selectAll(null).data(data1).enter().append("path").attr('d', link); /*curved connections*/
                }
            }
        })
    }

    var getLeafNodes = function(leafNodes, obj) {
        if (obj.values) {
            obj.values.forEach(function (child) {
                getLeafNodes(leafNodes, child)
            });
        } else {
            leafNodes.push(obj);
        }
        myleaves = leafNodes;
    }

    var findIds = function(json, name) {
        if (json.values) {
            if (json.key == name) {
                var leafNodes = [];
                getLeafNodes(leafNodes, json);
                //console.log("leafNodes = "+leafNodes.map(function(leafNode){ return leafNode.id; })); //Logs leaf node ids to the console
            } else {
                json.values.forEach(function (child) {
                    findIds(child, name);
                });
            }
        }
        //else console.log("other leaf "+JSON.stringify(json,null,1));
        //console.log("leafNodes end = "+leafNodes); //Logs leaf node ids to the console
    }

    var findOrders = function(data) {
        var myOrdersData = d3.nest()
            .key(function (d) {
                return d.order
            })
            .entries(data);
        //console.log("orders = "+myOrdersData.map(function(node){ return node.key; }));
        var myOrders = myOrdersData.map(function (node) {
            return node.key;
        })
        return myOrders;
    }

    var drawAnSVG = function() {
        var chartDiv = document.getElementById("plot");
        screenWidth = chartDiv.clientWidth
        plotWidth = screenWidth - 259.3
        console.log("w= " + screenWidth)
        svg = d3.select("svg");
        svg.attr("width", plotWidth)
            .attr("viewBox", "0 0 " + plotWidth + " 8100")
        g_axis = d3.select("#axis").append("svg")
            .attr("width", plotWidth + 10)//+10 for 'pozdniy pleystozen' which is larger then others
            .attr("height", 20)
            .append("g").attr("class", "axis")
        g_connections = svg.append("g").attr("class", "connections")
        g_val_scaner = svg.append("g").attr("class", "value_val_scaner")
        g = svg.append("g").attr("class", "taxons")
        //g_labels = svg.append("g").attr("class","labels");

    }

    var drawAnAxis = function() {
        var width = plotWidth
        x = d3.scaleLinear()
            .domain([-75, 0])
            .range([20, width - 85])

        var xAxis = d3.axisBottom(x)
        var xAxisPeriods = d3.axisTop(x)
        var periods = [];
        var pp;

        d3.tsv("Primat - Layers.tsv").then(function (data) { // make axis with periods from tsv
            data.forEach(function (d) {
                periods.push(d.date_start * (-1));
            });
            g_axis.append("g").attr("class", "axis axis--x")
                .call(xAxis.tickSize(1).tickSizeInner(1).tickSizeOuter(1) //ticks format
                //.tickValues(periods));
                    .tickValues([-70, -60, -50, -40, -30, -20, -10, 0])
                    .tickFormat(function (d, i) {
                        if (i == 0) return "70 млн. л. н"
                        if (i == 7) return "сейчас"
                        return d * (-1)
                    }))

            g_pp = g_axis.append("g").attr("class", "pretty_periods")
            periods.forEach(function (v, i, a) {
                if (i < a.length - 1)
                    g_pp.append("line")
                        .attr("x1", x(v))
                        .attr("x2", x(a[i + 1]))
                        .attr("y1", 0)
                        .attr("y2", 0)
                        .attr("stroke-width", 2)
                        .attr("stroke", () => {
                            var color = "yellow"

                            if (i % 3 == 0) color = "#DFDEDE"
                            if (i % 3 == 1) color = "#918F8F"
                            if (i % 3 == 2) color = "#BDBBBC"
                            return color
                        })
            })
            pp = data;
            return data;
        });

        //var periodNames = ["мел","палеоцен", "эоцен", "олигоцен","миоцен","плиоцен","плейстоцен","голоцен"];
        var periodNames = ["мел", "палеоцен", "эоцен", "олигоцен", "миоцен", "плиоцен"];
        g_axis.append("g").attr("class", "axis periods")
            .call(xAxisPeriods
            //.tickValues([-70,-61,-44.95,-28.465,-14.1815,-3.5695,-0.90885,0]) //last two make an axis  very dirty
                .tickValues([-70, -61, -44.95, -28.465, -14.1815, -3.5695])
                .tickValues([-70, -66, -56, -33.9, -23.03, -5.33])
                .tickFormat(function (d, i) {
                    return periodNames[i];
                })
                .tickPadding(5)
                .tickSize(0));

    }

    var drawValueScaner = function() {
        height = 10000
        var g_scaner = d3.select("#axis").select("svg")
            .append("g")
            .attr("class", "value_scaner");
        g_val_scaner.append("path").attr("class", "trackLine");//add the mouse-tracking vertical line
        svg.append("line").attr("class", "startLine")
            .attr("x1", x(0))
            .attr("y1", 20)
            .attr("x2", x(0))
            .attr("y2", height);

        var trackPeriodRect = g_scaner.append("rect");
        var trackPeriodText = g_scaner.append("text");
        var trackNumberRect = g_scaner.append("rect");
        var trackNumberText = g_scaner.append("text");

        var layersData=[];

        d3.tsv("Primat - Layers.tsv").then(function (data) {
            data.forEach(function (d) {
                layersData.push(d)
            })
        })

        d3.selectAll("svg").on("mousemove", function () {
            mousex = d3.mouse(this);
            d3.selectAll(".trackLine").style("display", null).attr("d", function () {
                if (x.invert(mousex[0]) <= 0) {
                    var d = "M" + mousex[0] + "," + (height);
                    d += " " + mousex[0] + "," + 20;

                    trackPeriodRect.attr("class", "scaner_back").attr("y", -22)
                        .attr("width", trackPeriodText.node().getBBox().width+5)
                        .attr("x", function (d) {
                            return (mousex[0])-2.5
                        });

                    var format = d3.format(".1f");
                    trackNumberRect.attr("class", "scaner_back")
                        .attr("y", 3)
                        .attr("x", (mousex[0])-2.5)
                        .attr("width", trackNumberText.node().getBBox().width+5)
                        .attr("height", 10)
                    trackNumberText.text(format(-x.invert(mousex[0])))
                        .attr("x", mousex[0])
                        .attr("y", 11)
                        .attr("text-anchor", "start");
                }
                return d;
            });

            var time = -x.invert(mousex[0]);

            layersData.forEach(function (d, i, a) {
                    if (i < a.length - 1) {
                        if (a[i].date_start > time && a[i + 1].date_start < time) {
                            trackPeriodText.text(a[i].sublayer + "  " + a[i].layer_ru)
                                .attr("x", function () {
                                    return (mousex[0])
                                })
                                .attr("y", -5);
                        }
                    }
                })
        })
        /*.on("mouseout", function(){ //hide the line
        mousex = d3.mouse(this);
        mousex = mousex[0] + 5;
        vertical.style("display", "none")});*/
    }

    var drawEpicOrderName = function(name, taxon) {
        g.append("text")
            .attr("class", "epicOrderName").text(taxon + " " + name)
            .attr("y", ypos + 30)
            .attr("x", plotWidth / 2 - 25)
        ypos = ypos + 50;
    }

    d3.selection.prototype.last = function () {
        return d3.select(this.nodes()[this.size() - 1]);
    }

    var resizeRect = function(name, i) {

        name = name.replace(/[|(|)|]| |=|\?|\./g, "")
        ypos = g.selectAll("g").last().node().getBBox().y + g.selectAll("g").last().node().getBBox().height + 10
        if (g.selectAll("g").last().attr("id", "")) ypos += 0
        var rect = g.selectAll("g#" + name + i).last().select("rect");
        var text = g.selectAll("g#" + name + i).last().select("text:not(.genus)");
        ///rect.clone(true).attr("stroke","red");
        var maxRightEdge = 0
        var flaf = false
        g.selectAll("#" + name + i + " ~ g > rect.rec_fam").nodes().forEach(function (node) {
            flaf = true
            rightEdge = node.getBBox().x + node.getBBox().width
            if (rightEdge > maxRightEdge) {
                maxRightEdge = rightEdge
            }
        })

        if (rect.node()) {
            hasSubFum = g.selectAll("g#" + name + i + ".family").last().select("g  rect.rec_subfam")

            newheight = ypos - rect.node().getBBox().y + delta
            newwidth = rect.node().getBBox().width + 10 + delta * 2

            itisFam = g.selectAll("g#" + name + i + ".family g").last()
            newex = rect.node().getBBox().x - delta
            if (hasSubFum.node()) {
                newwidth += 20;
                newex -= 10;
                delta = 10;
            }
            if (text.node())
                if ((newex + text.node().getBBox().width) > x(0)) { //move text lefter if its on the right edge
                    newXforText = x(0) - text.node().getBBox().width - 3
                }
                else newXforText = newex
            //console.log ("made resize "+name+" "+delta)
        }
        if (rect.classed("rec_invisible")) {
            //console.log("invis"+ name)
            newex = newex - delta * 2
            newheight = newheight - delta
            newwidth = newwidth - delta
            ypos = ypos - delta - 30 + 10
        }

        rect.attr("height", newheight)
            .attr("width", newwidth)
            .attr("x", newex)

        text.attr("x", newXforText)
        d3.select(text).node().each(makeBackgroundForText)

        if (flaf) {
            maxWidth = maxRightEdge - rect.node().getBBox().x
            rect
            //.clone(true).attr("class","rec_fam rec_clone")
                .attr("width", maxWidth + 10);
        }
        //ypos = ypos + 20 + delta * 1.5
        ypos = ypos + delta + 30

        delta = delta + 10

    }

    var drawRect = function(ids, name, prefix, taxon, i) {
        delta = 0
        trimname = name.replace(/[|(|)|]| |=|\?|\./g, "")
        const max_period = d3.max(ids, function (d) {
            return +d.period_start
        })
        const min_period = d3.min(ids, function (d) {
            return +d.period_end
        })
        const height_of_taxon = ids.length;

        var emptySubFam = false, atLeastOneSubTaxon = false, atLeastOneGen = false

        /*flag of empty subFamily*/
        if (taxon == "family")
            ids.forEach(function (id) {
                if (id.subfamily == "" && id.genus == "") emptySubFam = true
                /*so, we don't need a family rectangle*/
                if (id.subfamily) atLeastOneSubTaxon = true
                if (id.genus) atLeastOneGen = true
            })

        g1 = g.append("g").attr("id", trimname + i).attr("class", taxon)
        //g1=g_labels.append("g").attr("id",trimname+i).attr("class", taxon)

        if (emptySubFam == false || atLeastOneSubTaxon == true || atLeastOneGen == true) {

            g1.append("rect")
                .attr("class", "rec_fam")
                .attr("x", x(-1 * max_period) - 10)
                .attr("y", ypos)
                .attr("width", x((max_period)) - x((min_period)) + 10)
                //.attr("height", height_of_taxon * 20 + 10)
                .attr("filter", "url(#dropshadow)")
            g1.append("text")
            //.attr("class","rec_fam")
                .attr("x", x(-1 * (max_period)) + 1)
                .attr("y", ypos - 2)
                .attr("text-anchor", "start")
                .text(prefix + " " + name)
            //.each(moveText)
            ypos = ypos + 10
        }
        else { /*invisible rectangle*/
            g1.append("rect")
                .attr("class", "rec_fam rec_invisible")
                .attr("x", x(-1 * max_period))
                .attr("y", ypos - 20)
                .attr("width", x(max_period) - x(min_period) + 1)
                .attr("height", height_of_taxon * 20)
            //ypos-=20
        }

    }

    var drawBricks = function(bricks, fam) {

        const max_period = d3.max(bricks, function (d) {
            return +d.period_start
        })
        const min_period = d3.min(bricks, function (d) {
            return +d.period_end
        })
        var height_of_taxon = bricks.length;

        if (g1.selectAll("g:last-of-type").node())
            ypos = g1.select("g:last-of-type").node().getBBox().y + g1.select("g:last-of-type").node().getBBox().height
        else ypos = g1.node().getBBox().y


        g2 = g1.append("g").attr("id", fam)
        var emptyGen = false, atLeastOneSubTaxon = false, atLeastOneGen = false, greenRec = false
        var firstLocation = bricks[0].location, sameGens = false, locations = "(" + firstLocation
        var nameOfUnionBrick
        /*flag of empty genus etc*/
        i = bricks.length - 1;

        while (i >= 0) {
            /*if (review[index] === 'a') {
                review.splice(index, 1);*/

            //bricks.forEach(function (brick,i,object) {
            //console.log (i+ " " + bricks[i].id)
            if (bricks[i].genus == "") emptyGen = true
            /*so, we don't need a subfamily rectangle*/
            if (bricks[i].subfamily) atLeastOneSubTaxon = true
            if (bricks[i].genus) atLeastOneGen = true
            /*if (i>0 && brick.genus==bricks[0].genus && brick.period_start==bricks[0].period_start && brick.period_end==bricks[0].period_end) {
                sameGens=true
                locations=locations+", "+brick.location
                if (brick.family) nameOfUnionBrick="сем. "+brick.family
                if (brick.subfamily) nameOfUnionBrick="подсем. "+brick.subfamily
                if (brick.genus) nameOfUnionBrick=brick.genus
            }
            else sameGens=false*/
            /**/
            if (i > 0 && bricks[i - 1].period_start == bricks[i].period_start && bricks[i - 1].period_end == bricks[i].period_end && bricks[i - 1].genus == bricks[i].genus) {
                if (bricks[i - 1].location != bricks[i].location)
                    locations = bricks[i].location + ", " + bricks[i - 1].location
                else locations = bricks[i].location
                bricks[i - 1].location = locations
                if (bricks[i - 1].continent_id != bricks[i].continent_id)
                    bricks[i - 1].continent_id = "mix"
                bricks.splice(i, 1)
            }
            //else if (i>0) console.log("no "+bricks[i-1].id+" "+bricks[i].id)
            sameGens = false
            /**/
            //})


            i -= 1;
        }
        locations = locations + ")"
        height_of_taxon = bricks.length;

        if (atLeastOneGen == true && bricks[0].subfamily) {
            g2.append("rect")
                .attr("class", "rec_subfam")
                .attr("x", x(-1 * max_period) - 10)
                .attr("y", ypos + 20)
                .attr("width", x((max_period)) - x((min_period)) + 20)
                .attr("height", height_of_taxon * 20)
                .attr("filter", "url(#dropshadow)")
            g2.append("text")
            //.attr("class","rec_fam")
                .attr("x", x(-1 * (max_period)) - 10)
                .attr("y", ypos + 20)
                .attr("text-anchor", "start")
                .text("подсем. " + fam)
                .each(moveText)
                .each(makeBackgroundForText)

            greenRec = true
            delta = 0
        }

        if (sameGens == true) {
            console.log(bricks[0].id + " " + nameOfUnionBrick + " locations=", locations)
            //drawUnionBrick(nameOfUnionBrick, locations,ypos,bricks[0])
            // drawUsualBricks(bricks,ypos,atLeastOneGen,atLeastOneSubTaxon,greenRec)
        }
        else drawUsualBricks(bricks, ypos, atLeastOneGen, atLeastOneSubTaxon, greenRec)

    }

    var getColorOfTheBrick = function(continent) {
        var color
        switch (continent) {
            case 'africa':
                color = "#04c4d6";
                break;
            case 'europe':
                color = "#bcde05";
                break;
            case 'asia':
                color = "#3773ed";
                break;
            case 'n_america':
                color = "#ff0000";
                break;
            case 's_america':
                color = "#ff8a00";
                break;
            case 'oceania':
                color = "#c061c0";
                break;
            default:
                color = "#777";
                break;
        }
        return color
    }

    var drawPrimer = function(d) {
        if (d.period_start_old) {
            d3.select(this).clone(true)
                .attr("id", "primer" + d.id)
                .attr("width", (d) => {
                    var wid = x(d.period_start) - x(d.period_start_old);
                    return wid;
                })
                .attr("class", "primer")
        }
    }

    var drawUsualBricks = function(bricks, ypos, atLeastOneGen, atLeastOneSubTaxon, greenRec) {
        g2.selectAll("rect.brick").data(bricks).enter().append("rect")
            .attr("class", "brick") //create lines of period
            .attr("id", (d) => "id" + d.id)
            //.on ("click",handleGenusClick)
            .attr("rx", 1.5)
            .attr("ry", 1.5)
            .attr("x", (d) => {
                if (!d.period_start) console.log("alert! no period start! id=" + d.id);
                if (d.period_start == 0 && d.period_end == 0) return x(-1 * (d.period_start)) - 5;
                var wid = x(d.period_start) - x(d.period_end); //calculate length of line
                if (wid < 5 && d.period_end == 0) return x(0) - 5;
                return x(-1 * d.period_start);
            })
            .attr("y", (d, i) => ypos + i * 20 + 32)
            .attr("width", function (d) {
                var wid = x(d.period_start) - x(d.period_end); //calculate length of line
                if (wid < 5) wid = 5;
                return wid;
            })
            .attr("height", 5)
            .attr("stroke", "none")
            .attr("fill", "#ff8a00")

            .attr("fill", (d) => getColorOfTheBrick(d.continent_id))
            .each(drawPrimer);

        var desireLength = 120;//length of text labels


        g2.selectAll('text.genus').data(bricks).enter().append("text")//create signs for lines
        //g_labels.append("g").selectAll('text.genus').data(bricks).enter().append("text")
            .attr("class", "genus")
            .attr("id", (d) => "label_id_" + d.id)
            .text(function (d) {
                var loc = ""
                if (d.location) loc = " " + " (" + d.location + ")"
                if (d.genus == "—" || d.genus == "") { // oh really, no genus?
                    if (d.subfamily == "—" || d.subfamily == "") {
                        if (atLeastOneGen == true)
                            fullText = d.id + loc; //завершающая пустышка семейства

                        else
                            fullText = d.id + " " + "сем. " + d.family + loc;
                    }
                    else {
                        if (atLeastOneSubTaxon == true && greenRec)
                            fullText = d.id + loc;//завершающая пустышка подсемейства
                        else
                            fullText = d.id + " " + "подсем. " + d.subfamily + loc;
                    }
                }
                else
                    fullText = d.id + " " + d.genus + loc
                return fullText //full name of the brick
            })
            .attr("data-fullName", function () {
                return d3.select(this).text()
            }) //remember our full name in attr
            .text(function () {
                if (this.innerHTML.length > desireLength) dots = "..."; else dots = ""
                return d3.select(this).text().substring(0, desireLength) + dots // trim long name
            })
            .attr("x", function (d) {
                return x(-1 * d.period_start);
            })
            .attr("y", function (d, j) {
                return ypos + j * 20 + 30;
            })/*
            .on('mouseover', function(){
                d3.select(this).text(function () {
                    return this.getAttribute("data-fullName") //show full name
                });
            })
            .on ("mouseout", function () {
                d3.select(this).text(function () {
                    if (this.innerHTML.length>desireLength) dots="..."; else dots=""
                    return d3.select(this).text().substring(0, desireLength) + dots//back trim name
                })
            })*/
            .each(moveText)
            .each(makeBackgroundForText)
        ;
    }

    var makeBackgroundForText = function() {
        var width, height, x, y
        width = this.getBBox().width
        height = this.getBBox().height
        x = this.getBBox().x
        y = this.getBBox().y
        d3.select(this.parentNode).insert("rect", "text")
            .attr("x", x)
            .attr("y", y)
            .attr("width", width)
            .attr("height", height)
            .attr("class", "backForLabel")
    }


    var moveText = function() {
        var newX = 0
        var usualX = this.getBBox().x

        if ((usualX + this.getBBox().width) > x(0)) {
            newX = x(0) - this.getBBox().width - 3
            this.setAttribute("x", newX)
        }
    }

    var getSubOrders = function(order, data) {
        OrdersData = data.filter(function (d) {
            return d.order === order
        })
        SubOrdersDataRoot = d3.nest()
            .key(function (d) {
                return "root"
            })
            .key(function (d) {
                return d.suborder
            })
            .entries(OrdersData)
        var SubOrdersData = d3.nest()
            .key(function (d) {
                return d.suborder
            })
            .entries(OrdersData)
        var subOrders = SubOrdersData.map(function (node) {
            return node.key;
        })
        return subOrders
    }

    var getHypOrders = function(subOrder, data) {
        subOrdersData = OrdersData.filter(function (d) {
            return d.suborder === subOrder
        })
        HypOrdersDataRoot = d3.nest()
            .key(function (d) {
                return "root"
            })
            .key(function (d) {
                return d.hyporder
            })
            .entries(subOrdersData)
        var HypOrdersData = d3.nest()
            .key(function (d) {
                return d.hyporder
            })
            .entries(subOrdersData)
        var hypOrders = HypOrdersData.map(function (node) {
            return node.key;
        })
        return hypOrders
    }

    var getInfraOrders = function(hypOrder, data) {
        hypOrdersData = subOrdersData.filter(function (d) {
            return d.hyporder === hypOrder
        })
        infraOrdersDataRoot = d3.nest()
            .key(function (d) {
                return "root"
            })
            .key(function (d) {
                return d.infraorder
            })
            .entries(hypOrdersData)
        var infraOrdersData = d3.nest()
            .key(function (d) {
                return d.infraorder
            })
            .entries(hypOrdersData)
        var infraOrders = infraOrdersData.map(function (node) {
            return node.key;
        })
        return infraOrders
    }

    var getParvOrders = function(infraOrder, data) {
        infraOrdersData = hypOrdersData.filter(function (d) {
            return d.infraorder === infraOrder
        })
        parvOrdersDataRoot = d3.nest()
            .key(function (d) {
                return "root"
            })
            .key(function (d) {
                return d.parvorder
            })
            .entries(infraOrdersData)
        var parvOrdersData = d3.nest()
            .key(function (d) {
                return d.parvorder
            })
            .entries(infraOrdersData)
        var parvOrders = parvOrdersData.map(function (node) {
            return node.key;
        })
        return parvOrders
    }

    var getSuperFamilys = function(parvOrder, data) {
        parvOrdersData = infraOrdersData.filter(function (d) {
            return d.parvorder === parvOrder
        })
        superFamilysDataRoot = d3.nest()
            .key(function (d) {
                return "root"
            })
            .key(function (d) {
                return d.superfamily
            })
            .entries(parvOrdersData)
        var superFamilysData = d3.nest()
            .key(function (d) {
                return d.superfamily
            })
            .entries(parvOrdersData)
        var superFamilys = superFamilysData.map(function (node) {
            return node.key;
        })
        return superFamilys
    }

    var getFamilys = function(superFamily, data) {
        superFamilysData = parvOrdersData.filter(function (d) {
            return d.superfamily === superFamily
        })
        familysDataRoot = d3.nest()
            .key(function (d) {
                return "root"
            })
            .key(function (d) {
                return d.family
            })
            .entries(superFamilysData)
        familysData = d3.nest()
            .key(function (d) {
                return d.family
            })
            .entries(superFamilysData)
        var familys = familysData.map(function (node) {
            return node.key;
        })
        return familys
    }

    var getSubFamilys = function(family, data) {
        familysData = superFamilysData.filter(function (d) {
            return d.family === family
        })
        subfamilysDataRoot = d3.nest()
            .key(function (d) {
                return "root"
            })
            .key(function (d) {
                return d.subfamily
            })
            .entries(familysData)
        subfamilysData = d3.nest()
            .key(function (d) {
                return d.subfamily
            })
            .entries(familysData)
        //console.log("JJ="+JSON.stringify(subfamilysData[0],null,2))
        var subFamilys = subfamilysData.map(function (node) {
            return node.key;
        })
        return subFamilys
    }

    var initFilter = function() {
        /* For the drop shadow filter*/
        var defs = svg.append("defs");

        var filter = defs.append("filter")
            .attr("id", "dropshadow")
            .attr("height", "120%");

        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 4)
            .attr("result", "blur");
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 0)
            .attr("dy", 1)
            .attr("result", "offsetBlur");
        filter.append("feFlood")
            .attr("in", "offsetBlur")
            .attr("flood-color", "#000")
            .attr("flood-opacity", 0.2)
            .attr("result", "offsetColor");

        var feComposite = filter.append("feComposite")
        feComposite.attr("in", "offsetColor")
            .attr("in2", "offsetBlur")
            .attr("operator", "in")
            .attr("result", "offsetBlur")

        var feMerge = filter.append("feMerge");
        feMerge.append("feMereNode")
            .attr("in", "feFlood")
        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
    }

    $(window).scroll(function () {
        if ($(this).scrollTop() /*> $('#axis').outerHeight(includeMargin=true)*/) {
            $('#axis').addClass("sticky");
            $('#plot').addClass("sticky_plot");
            //set horizontal position of fixed axis div
            //var leftpos = ($(window).width() - $('#axis').width())/2;
            //$('#axis').css("left", leftpos);
        }
        else {
            $('#axis').removeClass("sticky");
            $('#plot').removeClass("sticky_plot");
        }
    });

    return {
        draw: function(){
           init();
        }
    }

})();