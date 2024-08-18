let isBadThoughtsExplodePluginEnabled = false;
let areExplodeMessagesDisabled = false;

let explodedCount = 0;

const badThoughts: ThoughtType[] = [
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

let pluginWindow: Window | undefined;

const togglePluginWindow = (): void => {
  if (pluginWindow) {
    pluginWindow.close();
    pluginWindow = undefined;
  } else {
    pluginWindow = ui.openWindow({
      classification: "bad_thoughts_explode",
      title: "Bad Thoughts Explode",
      width: 200,
      height: 90,
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
          onChange(isChecked) {
            isBadThoughtsExplodePluginEnabled = isChecked;
          },
        },
        {
          type: "checkbox",
          name: "disable_messages",
          x: 10,
          y: 40,
          width: 280,
          height: 20,
          text: "Disable messages",
          tooltip: "Disable showing messages when guests are marked to be exploded. This is just to reduce spam.",
          isChecked: areExplodeMessagesDisabled,
          onChange(isChecked) {
            areExplodeMessagesDisabled = isChecked;
          },
        },
        {
          type: "label",
          name: "exploded_count",
          x: 10,
          y: 70,
          width: 280,
          height: 20,
          text: `Exploded guests: ${explodedCount}`,
        },
      ],
    });
  }
};

const updatePluginWindow = (): void => {
  if (pluginWindow) {
    const explodedCountWidget = pluginWindow.findWidget<LabelWidget>("exploded_count");

    if (explodedCountWidget) {
      explodedCountWidget.text = `Exploded guests: ${explodedCount}`;
    }
  }
};

let guestMap: Record<number, Guest> = {};

const isBadThought = (thought: Thought): boolean => {
  return badThoughts.some((badThought) => thought.type === badThought);
};

const getBadThoughtsFromGuest = (guest: Guest): Thought[] => {
  return guest.thoughts.filter((thought) => isBadThought(thought));
};

const getGuestsWithBadThoughts = (): Guest[] => {
  const unhappyGuests = [];

  const allGuests = map.getAllEntities("guest");

  for (let i = 0; i < allGuests.length; i++) {
    const guest = allGuests[i];

    if (guest.isInPark) {
      const badThoughts = getBadThoughtsFromGuest(guest);

      if (badThoughts.length > 0 && guest.id) {
        unhappyGuests.push(guest);

        if (!areExplodeMessagesDisabled) {
          park.postMessage({ text: `${guest.name} will explode for thinking ${badThoughts[0].toString()}`, type: "peep", subject: guest.id });
        }
      }
    }
  }

  return unhappyGuests;
};

const resetGuestExplodeFlag = (): void => {
  for (const key in guestMap) {
    const guest = guestMap[key];

    guest.setFlag("explode", false);
  }
};

const initializePlugin = (): void => {
  if (typeof ui !== "undefined") {
    context.subscribe("interval.day", () => {
      if (!isBadThoughtsExplodePluginEnabled) {
        return;
      }

      for (const _key in guestMap) {
        explodedCount += 1;
      }

      guestMap = {};

      updatePluginWindow();

      const unhappyGuests = getGuestsWithBadThoughts();

      for (let i = 0; i < unhappyGuests.length; i++) {
        const guest = unhappyGuests[i];

        guest.setFlag("explode", true);

        if (guest.id) {
          guestMap[guest.id] = guest;
        }
      }
    });

    // Add a menu item under the map icon on the top toolbar
    ui.registerMenuItem("Bad Thoughts Explode", togglePluginWindow);

    try {
      park.postMessage({
        type: "blank",
        text: "Bad Thoughts Explode plugin successfully loaded, but not enabled. Click on the Bad Thoughts Explode menu item to enable it.",
      });
    } catch (error) {
      console.log(error);
      park.postMessage({
        type: "blank",
        text: `Bad thoughts explode plugin failed to load because of error: ${JSON.stringify(error)}`,
      });
    }
  } else {
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
  // API version 34 changed Entity.type to "guest" instead of "peep" so we want to target that at least
  // https://github.com/OpenRCT2/OpenRCT2/blob/develop/distribution/scripting.md#breaking-changes
  minApiVersion: 34,
  main: initializePlugin,
});
