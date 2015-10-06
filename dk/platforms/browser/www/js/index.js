/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // Launcher do jogo
        $(document).on('click', '.leader-board a,.leader-form a', function(e){
            e.preventDefault()
            $('.leader-board,.leader-form').removeClass('show');
        })
        $(function(){
            $(".leader-form form").submit(function(e){
              e.preventDefault()
              $('.leader-form p').text('Sending ...');
              $('.leader-form form').hide();
              $.post($('body').data('url')+'/api/', {name: $("#playername").val(), score: localStorage.barrelScore}).success(function(){
                $('.leader-form p').text('Leader Board Updated !');
                $('.leader-form form').hide();
                setTimeout(function(){
                    $('.leader-form').removeClass("show");
                },2500)
              })
            })
        })
        game.state.add('boot', boot);
        game.state.add('main', mainState);
        game.state.add('start', startState);
        game.state.start('boot');
        this.setScale();

        console.log('Start ');
    },
    setScale: function(){
        var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        if(width <= 320) return false
        var scale = width / 320;
        $('canvas').css('transform', 'scale('+scale+')')
        $('canvas').css('-webkit-transform', 'scale('+scale+')')
    }
};

app.initialize();