"use strict";
var isBadThoughtsExplodePluginEnabled = false;
var explodedCount = 0;
var badThoughts = [
    "cant_afford_ride",
    "spent_money",
    "sick",
    "very_sick",
    "more_thrilling",
    "intense",
    "sickening",
    "bad_value",
    "go_home",
    "cant_afford_item",
    "drowning",
    "lost",
    "queuing_ages",
    "tired",
    "cant_find",
    "not_paying",
    "not_while_raining",
    "bad_litter",
    "cant_find_exit",
    "get_off",
    "get_out",
    "not_safe",
    "path_disgusting",
    "crowded",
    "vandalism",
    "balloon_much",
    "toy_much",
    "map_much",
    "photo_much",
    "umbrella_much",
    "drink_much",
    "burger_much",
    "chips_much",
    "ice_cream_much",
    "candyfloss_much",
    "pizza_much",
    "popcorn_much",
    "hot_dog_much",
    "tentacle_much",
    "hat_much",
    "toffee_apple_much",
    "tshirt_much",
    "doughnut_much",
    "coffee_much",
    "chicken_much",
    "lemonade_much",
    "photo2_much",
    "photo3_much",
    "photo4_much",
    "pretzel_much",
    "hot_chocolate_much",
    "iced_tea_much",
    "funnel_cake_much",
    "sunglasses_much",
    "beef_noodles_much",
    "fried_rice_noodles_much",
    "wonton_soup_much",
    "meatball_soup_much",
    "fruit_juice_much",
    "soybean_milk_much",
    "sujongkwa_much",
    "sub_sandwich_much",
    "cookie_much",
    "roast_sausage_much",
    "help",
    "running_out",
];
var pluginWindow;
var togglePluginWindow = function () {
    if (pluginWindow) {
        pluginWindow.close();
        pluginWindow = undefined;
    }
    else {
        pluginWindow = ui.openWindow({
            classification: "bad_thoughts_explode",
            title: "Bad Thoughts Explode",
            width: 200,
            height: 65,
            widgets: [
                {
                    type: "checkbox",
                    name: "plugin_enable",
                    x: 10,
                    y: 20,
                    width: 280,
                    height: 20,
                    text: "Enable Bad Thoughts Explode",
                    isChecked: isBadThoughtsExplodePluginEnabled,
                    onChange: function (isChecked) {
                        isBadThoughtsExplodePluginEnabled = isChecked;
                    },
                },
                {
                    type: "label",
                    name: "exploded_count",
                    x: 10,
                    y: 40,
                    width: 280,
                    height: 20,
                    text: "Exploded guests: ".concat(explodedCount),
                },
            ],
        });
    }
};
var updatePluginWindow = function () {
    if (pluginWindow) {
        var explodedCountWidget = pluginWindow.findWidget("exploded_count");
        if (explodedCountWidget) {
            explodedCountWidget.text = "Exploded guests: ".concat(explodedCount);
        }
    }
};
var guestMap = {};
var isBadThought = function (thought) {
    return badThoughts.some(function (badThought) { return thought.type === badThought; });
};
var getBadThoughtsFromGuest = function (guest) {
    return guest.thoughts.filter(function (thought) { return isBadThought(thought); });
};
var getGuestsWithBadThoughts = function () {
    var unhappyGuests = [];
    var allGuests = map.getAllEntities("guest");
    for (var i = 0; i < allGuests.length; i++) {
        var guest = allGuests[i];
        if (guest.isInPark) {
            var badThoughts_1 = getBadThoughtsFromGuest(guest);
            if (badThoughts_1.length > 0 && guest.id) {
                unhappyGuests.push(guest);
                park.postMessage({ text: "".concat(guest.name, " will explode for thinking ").concat(badThoughts_1[0].toString()), type: "peep", subject: guest.id });
            }
        }
    }
    return unhappyGuests;
};
var resetGuestExplodeFlag = function () {
    for (var key in guestMap) {
        var guest = guestMap[key];
        guest.setFlag("explode", false);
    }
};
var initializePlugin = function () {
    if (typeof ui !== "undefined") {
        context.subscribe("interval.day", function () {
            if (!isBadThoughtsExplodePluginEnabled) {
                return;
            }
            for (var _key in guestMap) {
                explodedCount += 1;
            }
            guestMap = {};
            updatePluginWindow();
            var unhappyGuests = getGuestsWithBadThoughts();
            for (var i = 0; i < unhappyGuests.length; i++) {
                var guest = unhappyGuests[i];
                guest.setFlag("explode", true);
                if (guest.id) {
                    guestMap[guest.id] = guest;
                }
            }
        });
        ui.registerMenuItem("Bad Thoughts Explode", togglePluginWindow);
        try {
            park.postMessage({
                type: "blank",
                text: "Bad Thoughts Explode plugin successfully loaded, but not enabled. Click on the Bad Thoughts Explode menu item to enable it.",
            });
        }
        catch (error) {
            console.log(error);
            park.postMessage({
                type: "blank",
                text: "Bad thoughts explode plugin failed to load because of error: ".concat(JSON.stringify(error)),
            });
        }
    }
    else {
        park.postMessage({
            type: "blank",
            text: "Bad thoughts explode plugin cannot be loaded in this context. Is it possible you are running this in a headless environment or the multiplayer server?",
        });
    }
};
registerPlugin({
    name: "OpenRCT2 Bad Thoughts Explode",
    version: "1.0",
    authors: ["Marko Antolić"],
    type: "local",
    licence: "MIT",
    targetApiVersion: 70,
    minApiVersion: 34,
    main: initializePlugin,
});
