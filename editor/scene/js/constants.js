/* constants.js */
var DEFAULT_CULLING_MASK = 0xFFFFFFFF;
var GEOMETRY_ONLY_CULLING_MASK = 1 | 2 | 4;
var GIZMO_MASK = 8;

// Layer ids
var LAYERID_WORLD = 0;
var LAYERID_DEPTH = 1;
var LAYERID_SKYBOX = 2;
var LAYERID_IMMEDIATE = 3;
var LAYERID_UI = 4;

// Layout groups
var ORIENTATION_HORIZONTAL = 0;
var ORIENTATION_VERTICAL = 1;
var FITTING_NONE = 0;
var FITTING_STRETCH = 1
var FITTING_SHRINK = 2
var FITTING_BOTH = 3;

// Buttons
var BUTTON_TRANSITION_MODE_TINT = 0;
var BUTTON_TRANSITION_MODE_SPRITE_CHANGE = 1;

// Scroll Views
var SCROLL_MODE_CLAMP = 0;
var SCROLL_MODE_BOUNCE = 1;
var SCROLL_MODE_INFINITE = 2;

var SCROLLBAR_VISIBILITY_SHOW_ALWAYS = 0;
var SCROLLBAR_VISIBILITY_SHOW_WHEN_REQUIRED = 1;


var CURVE_LINEAR = 0;
var CURVE_SMOOTHSTEP = 1;
var CURVE_CATMULL = 2;
var CURVE_CARDINAL = 3;
var CURVE_SPLINE = 4;
var CURVE_STEP = 5;

// Script Loading Type
var LOAD_SCRIPT_AS_ASSET = 0;
var LOAD_SCRIPT_BEFORE_ENGINE = 1;
var LOAD_SCRIPT_AFTER_ENGINE = 2;