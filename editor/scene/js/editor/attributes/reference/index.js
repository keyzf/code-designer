/* editor/attributes/reference/attributes-settings-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        title: 'name',
        subTitle: '{String}',
        description: 'Name of the Scene for better navigation across content.'
    }, {
        name: 'editor',
        description: 'Editor Settings are applied per user basis and only visible to you, and not team collaborators. Although rest of other sections are shared for the Scene for all collaborators.'
    }, {
        name: 'snap',
        description: 'Change increment value for Snap gizmo state. Use SHIFT or Snap Toggle on toolbar to enable Snapping during use of Gizmos.'
    }, {
        name: 'grid',
        description: 'To disable grid set Divisions to 0. Divisions specify number of grid rectangles in each horizontal direction. And Size specifies the size of a rectangles.'
    }, {
        name: 'cameraClip',
        description: 'If your scene is too large or objects needs to be too close, change Near/Far clip values of a camera for Editor. This setting does not affects the game.'
    }, {
        name: 'clearColor',
        description: 'Set the Camera Clear Color of your preference to affect Editor. This color will not affect the game.'
    }, {
        name: 'iconSize',
        description: 'Size of icons displayed in Editor viewport',
    }, {
        name: 'showSkeleton',
        description: 'Set whether to render the bone structure of selected entity skeleton in the viewport',
    }, {
        name: 'localServer',
        description: 'Set a URL to use as the local server. When you click on "Launch Local" all your scripts will be loaded from this URL.'
    }, {
        name: 'locale',
        description: 'The locale that you can preview in the Editor and when you Launch your application. This is only visible to you not other members of your team.'
    }, {
        title: 'gravity',
        subTitle: '{pc.Vec3}',
        description: 'Gravity is the acceleration applied every frame to all rigid bodies in your scene. By default, it is set to -9.8 meters per second per second, which essentially approximates Earth\'s gravity. If you are making a game in space, you might want to set this to 0, 0, 0 (zero g).',
        url: 'http://developer.playcanvas.com/api/pc.RigidBodyComponentSystem.html#setGravity'
    }, {
        name: 'ammo',
        title: 'Physics Library',
        description: 'Add the Ammo asm.js and wasm modules to this project from the Playcanvas Store'
    }, {
        title: 'ambientColor',
        subTitle: '{pc.Color}',
        description: 'The color of the scene\'s ambient light source. PlayCanvas allows you to create directional, point and spot lights. These lights account for direct light that falls on objects. But in reality, light actually bounces around the environment and we call this indirect light. A global ambient light is a crude approximation of this and allows you to set a light source that appears to shine from all directions. The global ambient color is multiplied with the Ambient property of a Phong Material to add a contribution to the final color of an object. Note, if you are using a Skybox and Physical Materials the Ambient Color has no effect.',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#ambientLight'
    }, {
        title: 'skybox',
        subTitle: '{pc.Texture}',
        description: 'The Skybox is a cubemap asset that is rendered behind your 3D scene. This lets your use a set of 6 2D images to display the distant world beyond the 3D models in your scene. To add a skybox, create a cubemap asset and then assign it to the cubemap slot in the settings panel. Note, if you are using a Prefiltered Cubemap, the skybox will be used as the default environment map for all Physical materials.',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#skybox'
    }, {
        title: 'skyboxIntensity',
        subTitle: '{Number}',
        description: 'Intensity of the skybox to match the exposure levels.',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#skyboxIntensity'
    }, {
        title: 'skyboxMip',
        subTitle: '{Number}',
        description: 'Mip level of the prefiletered skybox, higher value is lower mip level which is lower resolution and more prefiltered (blured).',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#skyboxMip'
    }, {
        title: 'tonemapping',
        subTitle: '{Number}',
        description: 'tonemapping is the process of compressing High Dynamic Range (HDR) colors into limited Low Dynamic Range (e.g. into visible monitor output values). There are two options for tonemapping. Linear: imply scales HDR colors by exposure. Filmic: More sophisticated curve, good at softening overly bright spots, while preserving dark shades as well. Linear tonemapping is active by default, it\'s simply (color * exposure). You can tweak exposure to make quick changes to brightness. Note that it\'s not just simple brightness à la Photoshop because your input can be HDR. e.g. If you have a light source with intensity = 8, it will still be quite bright (4) after exposure = 0.5. So, all visible things won\'t just fade out linearly. Filmic tonemapping is a good choice in high-contrast environments, like scenes lit by bright Sun, or interiors with bright lights being close to walls/ceiling. It will nicely remap out-of-range super bright values to something more perceptually realistic (our eyes and film do tonemapping as well, we don\'t see physically linear values). Well, ask any photographer: nobody likes to leave extremely bright spots as well as pitch black spots on a photo. Filmic tonemapping gives you nice abilities to get rid of such spots.',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#tomeMapping'
    }, {
        title: 'exposure',
        subTitle: '{Number}',
        description: 'The exposure value tweaks the overall brightness of the scene.',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#exposure'
    }, {
        title: 'gammaCorrection',
        subTitle: '{pc.GAMMA_*}',
        description: 'Computer screens are set up to output not physically linear, but perceptually linear (sRGB) signal. However, for correct appearance when performing lighting calculations, color textures must be converted to physically linear space, and then the fully lit image must be fit again into sRGB. Rendering with gamma correction enabled reduces the number of ugly, overly saturated highlights and better preserves color after lighting, and it\'s generally recommended that this be enabled in your scene. The following image shows a simple scene with a sphere. On the left the scene has been gamma corrected while on the right, the scene is uncorrected.',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#gammaCorrection'
    }, {
        title: 'fog',
        subTitle: '{pc.FOG_*}',
        description: 'The Fog Type property can be used to control an approximation of an ambient fog in your scene. Here is an example of fog being enabled: The types available are as follows: None - Fog is disabled Linear - Fog fades in linearly between a Fog Start and Fog End distance Exp - Fog fades in from the view position according to an exponential function Exp2 - Fog fades in from the view position according to an exponential squared function',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#fog'
    }, {
        title: 'fogDensity',
        subTitle: '{Number}',
        description: 'The fog density controls the rate at which fog fades in for Exp and Exp2 fog types. Larger values cause fog to fade in more quickly. Fog density must be a positive number.',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#fogDensity'
    }, {
        name: 'fogDistance',
        title: 'fogStart / fogEnd',
        subTitle: '{Number}',
        description: 'The distance in scene units from the viewpoint from where the fog starts to fade in and reaches a maximum. Any objects beyond maximum distance will be rendered with the fog color.',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#fogEnd'
    }, {
        title: 'fogColor',
        subTitle: '{pc.Color}',
        description: 'The color of the fog. This color is blended with a surface\'s color more as the fog fades in.',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#fogColor'
    }, {
        name: 'loadingScreenScript',
        title: 'Loading Screen Script',
        description: 'The name of the script to use for creating the loading screen of the application. The script needs to call pc.script.createLoadingScreen.',
        url: 'http://developer.playcanvas.com/en/api/pc.script.html#createLoadingScreen'
    }, {
        name: 'project:externalScripts',
        title: 'External Scripts',
        description: 'The URLs of external scripts you would like to include in your application. These URLs are added as <script> tags in the main HTML page of the application before any other script is loaded.',
    }, {
        name: 'project',
        title: 'Project Settings',
        description: 'Settings that affect the entire Project and not just this Scene.'
    }, {
        name: 'project:width',
        title: 'Resolution Width',
        description: 'The width of your application in pixels.'
    }, {
        name: 'project:height',
        title: 'Resolution Height',
        description: 'The height of your application in pixels.'
    }, {
        name: 'project:fillMode',
        title: 'Fill Mode',
        description: 'Fill Mode decides how the canvas fills the browser window.'
    }, {
        name: 'project:resolutionMode',
        title: 'Resolution Mode',
        description: 'Resolution Mode decides whether the canvas resolution will change when it is resized.'
    }, {
        name: 'project:physics',
        description: 'When enabled the Physics library code is included in your app.'
    }, {
        name: 'project:pixelRatio',
        title: 'Device Pixel Ratio',
        description: 'When enabled the canvas resolution will be calculated including the device pixel ratio. Enabling this might affect performance.'
    }, {
        name: 'project:preferWebGl2',
        title: 'Prefer WebGL 2.0',
        description: 'When enabled (default) application will use WebGL 2.0 if platform supports it.'
    }, {
        name: 'project:antiAlias',
        title: 'Anti-Alias',
        description: 'When disabled, anti-aliasing will be disabled for back-buffer.'
    }, {
        name: 'project:transparentCanvas',
        title: 'Transparent Canvas',
        description: 'When enabled the canvas will blend with the web page.'
    }, {
        name: 'project:preserveDrawingBuffer',
        title: 'Preserve drawing buffer',
        description: 'When enabled the drawing buffer will be preserved until its explicitely cleared. Useful if you want to take screenshots.'
    }, {
        name: 'project:useLegacyAudio',
        title: 'Use Legacy Audio',
        description: 'If checked the old AudioSource component will be available in the Editor otherwise you will only see the new Sound component.'
    }, {
        name: 'project:useKeyboard',
        title: 'Enable Keyboard input',
        description: 'Disable this if you do not want to handle any keyboard input in your application.'
    }, {
        name: 'project:useMouse',
        title: 'Enable Mouse input',
        description: 'Disable this if you do not want to handle any mouse input in your application.'
    }, {
        name: 'project:useTouch',
        title: 'Enable Touch input',
        description: 'Disable this if you do not want to handle any touch input in your application.'
    }, {
        name: 'project:useGamepads',
        title: 'Enable Gamepad input',
        description: 'Disable this if you do not want to handle any gamepad input in your application.'
    }, {
        name: 'asset-tasks',
        title: 'Asset Tasks',
        description: 'Settings for defining default behaviour rules for asset pipeline jobs: assets extracting, textures resizing, etc.'
    }, {
        name: 'asset-tasks:texturePot',
        title: 'Texture power of two',
        description: 'When a texture is imported it will be resized to use the nearest power of two resolution.'
    }, {
        name: 'asset-tasks:textureDefaultToAtlas',
        title: 'Create Atlases',
        description: 'If enabled, when a texture is imported it will be converted to a Texture Atlas asset instead of a Texture asset.'
    }, {
        name: 'asset-tasks:searchRelatedAssets',
        title: 'Search related assets',
        description: 'If enabled, importing a source asset will update target assets where ever they are located. If disabled, assets will only be updated if they are in the same folder, otherwise new assets will be created.'
    }, {
        name: 'asset-tasks:preserveMapping',
        title: 'Preserve model material mappings',
        description: 'If enabled, after importing an existing source model we will try to preserve the material mappings that were set by the user on the existing model.'
    }, {
        name: 'asset-tasks:useModelV2',
        title: 'Force legacy model v2',
        description: 'Create model assets in legacy format (V2). Enable this for compatibility with older model imports.'
    }, {
        name: 'asset-tasks:overwrite:model',
        title: 'Overwrite models',
        description: 'When a model is imported, overwrite a previously imported model asset.'
    }, {
        name: 'asset-tasks:overwrite:animation',
        title: 'Overwrite animations',
        description: 'When a model is imported, overwrite previously imported animation assets.'
    }, {
        name: 'asset-tasks:overwrite:material',
        title: 'Overwrite materials',
        description: 'When a model is imported, overwrite previously imported material assets.'
    }, {
        name: 'asset-tasks:overwrite:texture',
        title: 'Overwrite textures',
        description: 'When a model is imported, overwrite previously imported texture assets.'
    }, {
        title: 'lightmapSizeMultiplier',
        subTitle: '{Number}',
        description: 'Auto-generated lightmap textures resolution is calculated using area of geometry in world space and size multiplier of model and scene. Changing this value will affect resolution of lightmaps for whole scene.',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#lightmapSizeMultiplier'
    }, {
        title: 'lightmapMaxResolution',
        subTitle: '{Number}',
        description: 'Maximum resolution for auto-generated lightmap textures.',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#lightmapMaxResolution'
    }, {
        title: 'lightmapMode',
        subTitle: '{Number}',
        description: 'The lightmap baking mode. Can be "Color Only" for just a single color lightmap or "Color and Direction" for single color plus dominant light direction (used for bump/specular).',
        url: 'http://developer.playcanvas.com/api/pc.Scene.html#lightmapMode'
    }, {
        name: 'batchGroups',
        title: 'Batch Groups',
        description: 'Manage batch groups for this project. Batch groups allow you to reduce draw calls by batching similar Models and Elements together.'
    }, {
        name: 'batchGroups:name',
        title: 'name',
        subTitle: '{String}',
        description: 'The name of the batch group'
    }, {
        name: 'batchGroups:dynamic',
        title: 'dynamic',
        subTitle: '{Boolean}',
        description: 'Enable this if you want to allow objects in this batch group to move/rotate/scale after being batched. If your objects are completely static then disable this field.'
    }, {
        name: 'batchGroups:maxAabbSize',
        title: 'maxAabbSize',
        subTitle: '{Number}',
        description: 'The maximum size of any dimension of a bounding box around batched objects. A larger size will batch more objects generating less draw calls but the batched objects will be larger and harder for the camera to cull. A smaller size will generate more draw calls (but less than without batching) but the resulting objects will be easier for the camera to cull.'
    }, {
        name: 'layers',
        title: 'Layers',
        description: 'Manage rendering Layers and their render order.'
    }, {
        name: 'layers:name',
        title: 'name',
        subTitle: '{String}',
        description: 'The name of the layer',
        url: 'http://developer.playcanvas.com/api/pc.Layer.html#name'
    }, {
        name: 'layers:opaqueSort',
        title: 'opaqueSortMode',
        subTitle: '{Number}',
        description: 'Defines the method used for sorting opaque mesh instances before rendering.',
        url: 'http://developer.playcanvas.com/api/pc.Layer.html#opaqueSortMode'
    }, {
        name: 'layers:transparentSort',
        title: 'transparentSortMode',
        subTitle: '{Number}',
        description: 'Defines the method used for sorting semi-transparent mesh instances before rendering.',
        url: 'http://developer.playcanvas.com/api/pc.Layer.html#transparentSortMode'
    }, {
        name: 'layers:order',
        title: 'Render Order',
        description: 'Manage the order of the rendering layers.'
    }, {
        name: 'layers:sublayers:opaque',
        title: 'Opaque Part',
        description: 'This is the part of the layer that renders the opaque mesh instances that belong to this layer.'
    }, {
        name: 'layers:sublayers:transparent',
        title: 'Transparent Part',
        description: 'This is the part of the layer that renders the semi-transparent mesh instances that belong to this layer.'
    }, {
        name: 'layers:sublayers:enabled',
        title: 'Enabled',
        description: 'Enables or disables this part of the layer. When a part is disabled the mesh instances of that part will not be rendered.'
    }, {
        name: 'localization:i18nAssets',
        title: 'Localization Assets',
        description: 'JSON Assets that contain localization data. Assets in this list will automatically be parsed for localization data when loaded. These are used to localized your Text Elements.'
    }, {
        name: 'localization:createAsset',
        description: 'Creates a new Localization JSON Asset with the default en-US format.'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'settings:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-sprite-editor-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'atlas:width',
        title: 'width',
        subTitle: '{Number}',
        description: 'The width of the texture atlas in pixels.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#width'
    }, {
        name: 'atlas:height',
        title: 'height',
        subTitle: '{Number}',
        description: 'The height of the texture atlas in pixels.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#height'
    }, {
        name: 'atlas:frames',
        title: 'Frames',
        description: 'The number of frames in the texture atlas. Each frame defines a region in the atlas.'
    }, {
        name: 'generate:method',
        title: 'METHOD',
        description: '"Delete Existing" will delete all frames from the texture atlas first and then create new frames. "Only Append" will append the new frames to the texture atlas without deleting the old ones.'
    }, {
        name: 'generate:type',
        title: 'TYPE',
        description: '"Grid By Frame Count" will create a grid of frames using the specified number of columns and rows. "Grid By Frame Size" will create a grid of frames using the specified frame size. Frames will only be created in areas of the atlas that are not completely transparent.'
    }, {
        name: 'generate:count',
        title: 'Frame Count',
        description: 'The number of columns and rows in the texture atlas.'
    }, {
        name: 'generate:size',
        title: 'Frame Size',
        description: 'The size of each frame in pixels.'
    }, {
        name: 'generate:offset',
        title: 'Offset',
        description: 'The offset from the top-left of the texture atlas in pixels, from where to start generating frames.'
    }, {
        name: 'generate:spacing',
        title: 'Spacing',
        description: 'The spacing between each frame in pixels.'
    }, {
        name: 'generate:pivot',
        title: 'Pivot',
        description: 'The pivot to use for each new frame.'
    }, {
        name: 'generate:generate',
        title: 'generate Atlas',
        description: 'Create new frames and add them to the atlas based on the method chosen above.'
    }, {
        name: 'generate:clear',
        title: 'Delete All Frames',
        description: 'Delete all frames from the texture atlas.'
    }, {
        name: 'import:texturepacker',
        title: 'Click here to upload a JSON file that has been created with the Texture Packer application. PlayCanvas will create new frames for your texture atlas based on that JSON file.'
    }, {
        name: 'sprites:addFrames',
        title: 'Add Frames',
        description: 'Add frames to this Sprite Asset. Click to start selecting the frames you want to add.'
    }, {
        name: 'frame:name',
        title: 'Name',
        description: 'The name of the frame(s).'
    }, {
        name: 'frame:position',
        title: 'Position',
        description: 'The left / bottom coordinates of the frame(s) in pixels.'
    }, {
        name: 'frame:size',
        title: 'Size',
        description: 'The size of the frame(s) in pixels.'
    }, {
        name: 'frame:pivotPreset',
        title: 'Pivot Preset',
        description: 'Presets for the pivot of the frame(s).'
    }, {
        name: 'frame:pivot',
        title: 'Pivot',
        description: 'The pivot of the frame(s) in 0-1 units starting from the left / bottom coordinates of the frame(s).'
    }, {
        name: 'frame:border',
        title: 'Border',
        description: 'The border of the frame(s) in pixels when using 9 Slicing. Each field specifies the distance from the left / bottom / right / top edges of the frame(s) respectively.'
    }, {
        name: 'frame:newsprite',
        title: 'New Sprite',
        description: 'Create a new Sprite Asset with the selected frames.'
    }, {
        name: 'frame:focus',
        title: 'Focus',
        subTitle: 'Shortcut: F',
        description: 'Focus on the selected frame.'
    }, {
        name: 'frame:trim',
        title: 'Trim',
        subTitle: 'Shortcut: T',
        description: 'Resize the selected frames so that they fit around the edge of the graphic based on transparency.'
    }, {
        name: 'frame:delete',
        subTitle: 'Shortcut: Delete',
        title: 'Delete',
        description: 'Delete the selected frames.'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'spriteeditor:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-entity-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        title: 'enabled',
        subTitle: '{Boolean}',
        description: 'If unchecked, entity wont be processed nor any of its components.',
        url: 'http://developer.playcanvas.com/api/pc.Entity.html'
    }, {
        title: 'name',
        subTitle: '{String}',
        description: 'Human-readable name for this graph node.',
        url: 'http://developer.playcanvas.com/api/pc.Entity.html#name'
    }, {
        title: 'tags',
        subTitle: '{pc.Tags}',
        description: '',
        url: 'http://developer.playcanvas.com/api/pc.Entity.html#tags'
    }, {
        name: 'position',
        title: 'Position',
        description: 'Position in Local Space'
    }, {
        name: 'rotation',
        title: 'Rotation',
        description: 'Rotation in Local Space'
    }, {
        name: 'scale',
        title: 'Scale',
        description: 'Scale in Local Space'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'entity:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-animation-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.AnimationComponent',
        subTitle: '{pc.Component}',
        description: 'Enables an entity to specify which animations can be applied to the model assigned to its model component.',
        url: 'http://developer.playcanvas.com/api/pc.AnimationComponent.html'
    }, {
        title: 'assets',
        subTitle: '{Number[]}',
        description: 'The animation assets that can be utilized by this entity. Multiple animations can be assigned via the picker control.',
        url: 'http://developer.playcanvas.com/api/pc.AnimationComponent.html#assets'
    }, {
        title: 'speed',
        subTitle: '{Number}',
        description: 'A multiplier for animation playback speed. 0 will freeze animation playback, and 1 represents the normal playback speed of the asset.',
        url: 'http://developer.playcanvas.com/api/pc.AnimationComponent.html#speed'
    }, {
        title: 'activate',
        subTitle: '{Boolean}',
        description: 'If checked, the component will start playing the animation on load.',
        url: 'http://developer.playcanvas.com/api/pc.AnimationComponent.html#activate'
    }, {
        title: 'loop',
        subTitle: '{Boolean}',
        description: 'If checked, the animation will continue to loop back to the start on completion. Otherwise, the animation will come to a stop on its final frame.',
        url: 'http://developer.playcanvas.com/api/pc.AnimationComponent.html#loop'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'animation:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-audiolistener-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.AudioListenerComponent',
        subTitle: '{pc.Component}',
        description: 'Specifies the listener\'s position in 3D space. All 3D audio playback will be relative to this position.',
        url: 'http://developer.playcanvas.com/api/pc.AudioListenerComponent.html'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'audiolistener:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-audiosource-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.AudioSourceComponent',
        subTitle: '{pc.Component}',
        description: 'The AudioSource Component controls playback of an audio sample. This class will be deprecated in favor of {@link pc.SoundComponent}.',
        url: 'http://developer.playcanvas.com/api/pc.AudioSourceComponent.html'
    }, {
        title: '3d',
        subTitle: '{Boolean}',
        description: 'If checked, the component will play back audio assets as if played from the location of the entity in 3D space.',
        url: 'http://developer.playcanvas.com/api/pc.AudioSourceComponent.html#3d'
    }, {
        title: 'activate',
        subTitle: '{Boolean}',
        description: 'If checked, the first audio asset specified by the Assets property will be played on load. Otherwise, audio assets will need to be played using script.',
        url: 'http://developer.playcanvas.com/api/pc.AudioSourceComponent.html#activate'
    }, {
        title: 'assets',
        subTitle: '{Number[]}',
        description: 'The audio assets that can be played from this audio source. Multiple audio assets can be specified by the picker control.',
        url: 'http://developer.playcanvas.com/api/pc.AudioSourceComponent.html#assets'
    }, {
        title: 'loop',
        subTitle: '{Boolean}',
        description: 'If checked, the component will loop played audio assets continuously. Otherwise, audio assets are played once to completion.',
        url: 'http://developer.playcanvas.com/api/pc.AudioSourceComponent.html#loop'
    }, {
        title: 'distance',
        subTitle: '{Number}',
        description: 'minDistance - the distance at which the volume of playback begins to fall from its maximum. maxDistance - The distance at which the volume of playback falls to zero.',
        url: 'http://developer.playcanvas.com/api/pc.AudioSourceComponent.html#maxDistance'
    }, {
        title: 'minDistance',
        subTitle: '{Number}',
        description: 'The distance at which the volume of playback begins to fall from its maximum',
        url: 'http://developer.playcanvas.com/api/pc.AudioSourceComponent.html#minDistance'
    }, {
        title: 'maxDistance',
        subTitle: '{Number}',
        description: 'The distance at which the volume of playback falls to zero.',
        url: 'http://developer.playcanvas.com/api/pc.AudioSourceComponent.html#maxDistance'
    }, {
        title: 'pitch',
        subTitle: '{Number}',
        description: 'The pitch to playback the audio at. A value of 1 means the audio is played back at the original pitch.',
        url: 'http://developer.playcanvas.com/api/pc.AudioSourceComponent.html#pitch'
    }, {
        title: 'rollOffFactor',
        subTitle: '{Number}',
        description: 'The rate at which volume fall-off occurs.',
        url: 'http://developer.playcanvas.com/api/pc.AudioSourceComponent.html#rollOffFactor'
    }, {
        title: 'volume',
        subTitle: '{Number}',
        description: 'The volume of the audio assets played back by the component.',
        url: 'http://developer.playcanvas.com/api/pc.AudioSourceComponent.html#volume'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'audiosource:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }

    editor.call('attributes:reference:add', {
        name: 'audio:assets',
        title: 'assets',
        subTitle: '{Number[]}',
        description: 'The audio assets that can be played from this audio source. Multiple audio assets can be specified by the picker control.',
        url: 'http://developer.playcanvas.com/api/pc.AudioSourceComponent.html#assets'
    });
});


/* editor/attributes/reference/attributes-components-sound-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.SoundComponent',
        subTitle: '{pc.Component}',
        description: 'The Sound Component controls playback of sounds',
        url: 'http://developer.playcanvas.com/api/pc.SoundComponent.html'
    }, {
        title: 'positional',
        subTitle: '{Boolean}',
        description: 'If checked, the component will play back audio assets as if played from the location of the entity in 3D space.',
        url: 'http://developer.playcanvas.com/api/pc.SoundComponent.html#positional'
    }, {
        title: 'distance',
        subTitle: '{Number}',
        description: "refDistance - The reference distance for reducing volume as the sound source moves further from the listener. maxDistance - The maximum distance from the listener at which audio falloff stops. Note the volume of the audio is not 0 after this distance, but just doesn't fall off anymore.",
        url: 'http://developer.playcanvas.com/api/pc.SoundComponent.html#refDistance'
    }, {
        title: 'refDistance',
        subTitle: '{Number}',
        description: "The reference distance for reducing volume as the sound source moves further from the listener.",
        url: 'http://developer.playcanvas.com/api/pc.SoundComponent.html#refDistance'
    }, {
        title: 'maxDistance',
        subTitle: '{Number}',
        description: "The maximum distance from the listener at which audio falloff stops. Note the volume of the audio is not 0 after this distance, but just doesn't fall off anymore.",
        url: 'http://developer.playcanvas.com/api/pc.SoundComponent.html#maxDistance'
    }, {
        title: 'pitch',
        subTitle: '{Number}',
        description: 'The pitch to playback the audio at. A value of 1 means the audio is played back at the original pitch. The pitch of each slot is multiplied with this value.',
        url: 'http://developer.playcanvas.com/api/pc.SoundComponent.html#pitch'
    }, {
        title: 'rollOffFactor',
        subTitle: '{Number}',
        description: 'The rate at which volume fall-off occurs.',
        url: 'http://developer.playcanvas.com/api/pc.SoundComponent.html#rollOffFactor'
    }, {
        title: 'volume',
        subTitle: '{Number}',
        description: 'The volume modifier to play the audio with. The volume of each slot is multiplied with this value.',
        url: 'http://developer.playcanvas.com/api/pc.SoundComponent.html#volume'
    }, {
        title: 'distanceModel',
        subTitle: '{String}',
        description: 'Determines which algorithm to use to reduce the volume of the audio as it moves away from the listener.'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'sound:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-soundslot-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'slot',
        title: 'pc.SoundSlot',
        description: 'The SoundSlot controls playback of an audio asset.',
        url: 'http://developer.playcanvas.com/api/pc.SoundSlot.html'
    }, {
        title: 'name',
        subTitle: '{String}',
        description: 'The name of the slot',
        url: 'http://developer.playcanvas.com/api/pc.SoundSlot.html#name'
    }, {
        title: 'startTime',
        subTitle: '{Number}',
        description: 'The start time from which the sound will start playing.',
        url: 'http://developer.playcanvas.com/api/pc.SoundSlot.html#startTime'
    }, {
        title: 'duration',
        subTitle: '{String}',
        description: 'The duration of the sound that the slot will play starting from startTime.',
        url: 'http://developer.playcanvas.com/api/pc.SoundSlot.html#duration'
    }, {
        title: 'autoPlay',
        subTitle: '{Boolean}',
        description: 'If checked, the slot will be played on load. Otherwise, sound slots will need to be played by scripts.',
        url: 'http://developer.playcanvas.com/api/pc.SoundSlot.html#autoPlay'
    }, {
        title: 'overlap',
        subTitle: '{Boolean}',
        description: 'If true then sounds played from slot will be played independently of each other. Otherwise the slot will first stop the current sound before starting the new one.',
        url: 'http://developer.playcanvas.com/api/pc.SoundSlot.html#overlap'
    }, {
        title: 'asset',
        subTitle: '{Number}',
        description: 'The audio asset that can be played from this sound slot.',
        url: 'http://developer.playcanvas.com/api/pc.SoundSlot.html#asset'
    }, {
        title: 'loop',
        subTitle: '{Boolean}',
        description: 'If checked, the slot will loop playback continuously. Otherwise, it will be played once to completion.',
        url: 'http://developer.playcanvas.com/api/pc.SoundSlot.html#loop'
    }, {
        title: 'pitch',
        subTitle: '{Number}',
        description: 'The pitch to playback the audio at. A value of 1 means the audio is played back at the original pitch.',
        url: 'http://developer.playcanvas.com/api/pc.SoundComponent.html#pitch'
    }, {
        title: 'volume',
        subTitle: '{Number}',
        description: 'The volume modifier to play the audio with.',
        url: 'http://developer.playcanvas.com/api/pc.SoundComponent.html#volume'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'sound:slot:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-camera-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.CameraComponent',
        subTitle: '{pc.Component}',
        description: 'Enables an entity to render a scene from a certain viewpoint.',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html'
    }, {
        title: 'clearColor',
        subTitle: '{pc.Color}',
        description: 'The color used to clear the camera\'s render target.',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html#clearColor'
    }, {
        title: 'clearColorBuffer',
        subTitle: '{Boolean}',
        description: 'If selected, the camera will explicitly clear its render target to the chosen clear color before rendering the scene.',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html#clearColorBuffer'
    }, {
        title: 'clearDepthBuffer',
        subTitle: '{Boolean}',
        description: 'If selected, the camera will explicitly clear the depth buffer of its render target before rendering the scene.',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html#clearDepthBuffer'
    }, {
        name: 'clip',
        title: 'nearClip / farClip',
        subTitle: '{Number}',
        description: 'The distance in camera space from the camera\'s eye point to the near and far clip planes.',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html#farClip'
    }, {
        title: 'nearClip',
        subTitle: '{Number}',
        description: 'The distance in camera space from the camera\'s eye point to the near plane.',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html#nearClip'
    }, {
        title: 'farClip',
        subTitle: '{Number}',
        description: 'The distance in camera space from the camera\'s eye point to the far plane.',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html#farClip'
    }, {
        title: 'fov',
        subTitle: '{Number}',
        description: 'Field of View is the angle between top and bottom clip planes of a perspective camera.',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html#fov'
    }, {
        title: 'frustumCulling',
        subTitle: '{Boolean}',
        description: 'Controls the culling of mesh instances against the camera frustum. If true, culling is enabled. If false, all mesh instances in the scene are rendered by the camera, regardless of visibility. Defaults to false.',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html#frustumCulling'
    }, {
        title: 'orthoHeight',
        subTitle: '{Number}',
        description: 'The distance in world units between the top and bottom clip planes of an orthographic camera.',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html#orthoHeight'
    }, {
        title: 'priority',
        subTitle: '{Number}',
        description: 'A number that defines the order in which camera views are rendered by the engine. Smaller numbers are rendered first.',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html#priority'
    }, {
        title: 'projection',
        subTitle: '{pc.PROJECTION_*}',
        description: 'The projection type of the camera.',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html#projection'
    }, {
        title: 'rect',
        subTitle: '{pc.Vec4}',
        description: 'A rectangle that specifies the viewport onto the camera\'s attached render target. This allows you to implement features like split-screen or picture-in-picture. It is defined by normalised coordinates (0 to 1) in the following format: x: The lower left x coordinate y: The lower left y coordinate w: The width of the rectangle h: The height of the rectangle',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html#rect'
    }, {
        name: 'layers',
        title: 'layers',
        subTitle: '{Number[]}',
        description: 'The layers that this camera will render.',
        url: 'http://developer.playcanvas.com/api/pc.CameraComponent.html#layers'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'camera:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-collision-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.CollisionComponent',
        subTitle: '{pc.Component}',
        description: 'A collision volume. use this in conjunction with a pc.RigidBodyComponent to make a collision volume that can be simulated using the physics engine. If the pc.Entity does not have a pc.RigidBodyComponent then this collision volume will act as a trigger volume. When an entity with a dynamic or kinematic body enters or leaves an entity with a trigger volume, both entities will receive trigger events.',
        url: 'http://developer.playcanvas.com/api/pc.CollisionComponent.html'
    }, {
        title: 'asset',
        subTitle: '{Number}',
        description: 'The model asset that will be used as a source for the triangle-based collision mesh.',
        url: 'http://developer.playcanvas.com/api/pc.CollisionComponent.html#asset'
    }, {
        title: 'axis',
        subTitle: '{Number}',
        description: 'Aligns the capsule/cylinder with the local-space X, Y or Z axis of the entity',
        url: 'http://developer.playcanvas.com/api/pc.CollisionComponent.html#axis'
    }, {
        title: 'halfExtents',
        subTitle: '{pc.Vec3}',
        description: 'The half-extents of the collision box. This is a 3-dimensional vector: local space half-width, half-height, and half-depth.',
        url: 'http://developer.playcanvas.com/api/pc.CollisionComponent.html#halfExtents'
    }, {
        title: 'height',
        subTitle: '{Number}',
        description: 'The tip-to-tip height of the capsule/cylinder.',
        url: 'http://developer.playcanvas.com/api/pc.CollisionComponent.html#height'
    }, {
        title: 'radius',
        subTitle: '{Number}',
        description: 'The radius of the capsule/cylinder body.',
        url: 'http://developer.playcanvas.com/api/pc.CollisionComponent.html#radius'
    }, {
        title: 'type',
        subTitle: '{String}',
        description: 'The type of collision primitive. Can be: box, sphere, capsulse, cylinder, mesh.',
        url: 'http://developer.playcanvas.com/api/pc.CollisionComponent.html#type'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'collision:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-light-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.LightComponent',
        subTitle: '{pc.Component}',
        description: 'The Light Component enables the Entity to light the scene.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html'
    }, {
        title: 'isStatic',
        subTitle: '{Boolean}',
        description: 'Mark light as non-movable (optimization).',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#isStatic'
    }, {
        title: 'castShadows',
        subTitle: '{Boolean}',
        description: 'If checked, the light will cause shadow casting models to cast shadows.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#castShadows'
    }, {
        title: 'color',
        subTitle: '{pc.Color}',
        description: 'The color of the emitted light.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#color'
    }, {
        title: 'falloffMode',
        subTitle: '{pc.LIGHTFALLOFF_*}',
        description: 'Controls the rate at which a light attentuates from its position.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#falloffMode'
    }, {
        title: 'coneAngles',
        subTitle: '{Number}',
        description: 'The angles from the spotlight\'s direction at which light begins to fall from its maximum (innerConeAngle) and zero value (outerConeAngle).',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#innerConeAngle'
    }, {
        title: 'intensity',
        subTitle: '{Number}',
        description: 'The intensity of the light, this acts as a scalar value for the light\'s color. This value can exceed 1.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#intensity'
    }, {
        title: 'normalOffsetBias',
        subTitle: '{Number}',
        description: 'Normal offset depth bias.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#normalOffsetBias'
    }, {
        title: 'range',
        subTitle: '{Number}',
        description: 'The distance from the spotlight source at which its contribution falls to zero.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#range'
    }, {
        title: 'shadowBias',
        subTitle: '{Number}',
        description: 'Constant depth offset applied to a shadow map that enables the tuning of shadows in order to eliminate rendering artifacts, namely \'shadow acne\' and \'peter-panning\'.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#shadowBias'
    }, {
        title: 'shadowDistance',
        subTitle: '{Number}',
        description: 'The shadow distance is the maximum distance from the camera beyond which shadows that come from Directional Lights are no longer visible. Smaller values produce more detailed shadows. The closer the limit the less shadow data has to be mapped to, and represented by, any shadow map; shadow map pixels are mapped spatially and so the less distance the shadow map has to cover, the smaller the pixels and so the more resolution any shadow has.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#shadowDistance'
    }, {
        title: 'shadowResolution',
        subTitle: '{Number}',
        description: 'The size of the texture used for the shadow map.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#shadowResolution'
    },{
        title: 'type',
        subTitle: '{String}',
        description: 'The type of light. Can be: directional, point, spot.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#type'
    }, {
        title: 'affectDynamic',
        subTitle: '{Boolean}',
        description: 'If enabled the light will affect non-lightmapped objects.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#affectDynamic'
    }, {
        title: 'affectLightmapped',
        subTitle: '{Boolean}',
        description: 'If enabled the light will affect lightmapped objects.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#affectLightmapped'
    }, {
        title: 'bake',
        subTitle: '{Boolean}',
        description: 'If enabled the light will be rendered into lightmaps.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#bake'
    }, {
        title: 'bakeDir',
        subTitle: '{Boolean}',
        description: 'If enabled and bake=true, the light\'s direction will contribute to directional lightmaps.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#bakeDir'
    }, {
        title: 'shadowUpdateMode',
        subTitle: '{pc.SHADOWUPDATE_*}',
        description: 'Tells the renderer how often shadows must be updated for this light. Options:\n<b>pc.SHADOWUPDATE_NONE</b>: Don\'t render shadows.\n<b>pc.SHADOWUPDATE_THISFRAME</b>: Render shadows only once (then automatically switches to pc.SHADOWUPDATE_NONE).\n<b>pc.SHADOWUPDATE_REALTIME</b>: Render shadows every frame (default)',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#shadowUpdateMode'
    }, {
        title: 'shadowType',
        subTitle: '{pc.SHADOW_*}',
        description: 'Type of shadows being rendered by this light. Options:\n<b>pc.SHADOW_PCF3</b>: Render packed depth, can be used for PCF sampling.\n<b>pc.SHADOW_PCF5</b>: Render depth buffer only, can be used for better hardware-accelerated PCF sampling. Requires WebGL2. Falls back to pc.SHADOW_PCF3 on WebGL 1.0.\n<b>pc.SHADOW_VSM8</b>: Render packed variance shadow map. All shadow receivers must also cast shadows for this mode to work correctly.\n<b>pc.SHADOW_VSM16</b>: Render 16-bit exponential variance shadow map. Requires OES_texture_half_float extension. Falls back to pc.SHADOW_VSM8, if not supported.\n<b>pc.SHADOW_VSM32</b>: Render 32-bit exponential variance shadow map. Requires OES_texture_float extension. Falls back to pc.SHADOW_VSM16, if not supported.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#shadowType'
    }, {
        title: 'vsmBlurMode',
        subTitle: '{pc.BLUR_*}',
        description: 'Blurring mode for variance shadow maps:\n<b>pc.BLUR_BOX</b>: Box filter.\n<b>pc.BLUR_GAUSSIAN</b>: Gaussian filter. May look smoother than box, but requires more samples.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#vsmBlurMode'
    }, {
        title: 'vsmBlurSize',
        subTitle: '{Number}',
        description: 'Number of samples used for blurring a variance shadow map. Only uneven numbers work, even are incremented. Minimum value is 1, maximum is 25',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#vsmBlurSize'
    }, {
        title: 'vsmBias',
        subTitle: '{Number}',
        description: 'Constant depth offset applied to a shadow map that enables the tuning of shadows in order to eliminate rendering artifacts, namely \'shadow acne\' and \'peter-panning\'',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#vsmBias'
    }, {
        title: 'cookie',
        subTitle: '{pc.Texture}',
        description: 'Projection texture. Must be 2D for spot and cubemap for point (ignored if incorrect type is used).',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#cookie'
    }, {
        title: 'cookieAsset',
        subTitle: '{pc.Asset}',
        description: 'Asset that has texture that will be assigned to cookie internally once asset resource is available.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#cookieAsset'
    }, {
        title: 'cookieIntensity',
        subTitle: '{Number}',
        description: 'Projection texture intensity.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#cookieIntensity'
    }, {
        title: 'cookieFalloff',
        subTitle: '{Boolean}',
        description: 'Toggle normal spotlight falloff when projection texture is used. When set to false, spotlight will work like a pure texture projector (only fading with distance)',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#cookieFalloff'
    }, {
        title: 'cookieChannel',
        subTitle: '{String}',
        description: 'Color channels of the projection texture to use. Can be "r", "g", "b", "a", "rgb" or any swizzled combination.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#cookieChannel'
    }, {
        title: 'cookieAngle',
        subTitle: '{Number}',
        description: 'Angle for spotlight cookie rotation.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#cookieAngle'
    }, {
        title: 'cookieOffset',
        subTitle: '{pc.Vec2}',
        description: 'Spotlight cookie position offset.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#cookieOffset'
    }, {
        title: 'cookieScale',
        subTitle: '{pc.Vec2}',
        description: 'Spotlight cookie scale.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#cookieScale'
    }, {
        name: 'layers',
        title: 'layers',
        subTitle: '{Number[]}',
        description: 'The layers that this light will affect.',
        url: 'http://developer.playcanvas.com/api/pc.LightComponent.html#layers'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'light:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-model-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.ModelComponent',
        subTitle: '{pc.Component}',
        description: 'Enables an Entity to render a model or a primitive shape. This Component attaches additional model geometry in to the scene graph below the Entity.',
        url: 'http://developer.playcanvas.com/api/pc.ModelComponent.html'
    }, {
        title: 'isStatic',
        subTitle: '{Boolean}',
        description: 'Mark model as non-movable (optimization).',
        url: 'http://developer.playcanvas.com/api/pc.ModelComponent.html#isStatic'
    }, {
        title: 'asset',
        subTitle: '{Number}',
        description: 'The model asset rendered by this model component. Only a single model can be rendered per model component.',
        url: 'http://developer.playcanvas.com/api/pc.ModelComponent.html#asset'
    }, {
        title: 'castShadows',
        subTitle: '{Boolean}',
        description: 'If enabled, the model rendered by this component will cast shadows onto other models in the scene.',
        url: 'http://developer.playcanvas.com/api/pc.ModelComponent.html#castShadows'
    }, {
        title: 'materialAsset',
        subTitle: '{Number}',
        description: 'The material that will be used to render the model (only applies to primitives)',
        url: 'http://developer.playcanvas.com/api/pc.ModelComponent.html#materialAsset'
    }, {
        title: 'receiveShadows',
        subTitle: '{Boolean}',
        description: 'If enabled, the model rendered by this component will receive shadows cast by other models in the scene.',
        url: 'http://developer.playcanvas.com/api/pc.ModelComponent.html#receiveShadows'
    }, {
        title: 'type',
        subTitle: '{String}',
        description: 'The type of the model to be rendered. Can be: asset, box, capsule, cone, cylinder, sphere.',
        url: 'http://developer.playcanvas.com/api/pc.ModelComponent.html#type'
    }, {
        title: 'castShadowsLightmap',
        subTitle: '{Boolean}',
        description: 'If true, this model will cast shadows when rendering lightmaps',
        url: 'http://developer.playcanvas.com/api/pc.ModelComponent.html#castShadowsLightmap'
    }, {
        title: 'lightmapped',
        subTitle: '{Boolean}',
        description: 'If true, this model will be lightmapped after using lightmapper.bake()',
        url: 'http://developer.playcanvas.com/api/pc.ModelComponent.html#lightmapped'
    }, {
        title: 'lightmapSizeMultiplier',
        subTitle: '{Number}',
        description: 'Changing this value will affect resolution of lightmaps for this model',
        url: 'http://developer.playcanvas.com/api/pc.ModelComponent.html#lightmapSizeMultiplier'
    }, {
        title: 'batchGroupId',
        subTitle: '{Number}',
        description: 'The batch group that this model belongs to. The engine will attempt to batch models in the same batch group to reduce draw calls.',
        url: 'http://developer.playcanvas.com/api/pc.ModelComponent.html#batchGroupId'
    }, {
        name: 'resolution',
        description: 'Auto-generated lightmap textures resolution is calculated using area of geometry in world space and size multiplier of model and scene.',
        url: 'http://developer.playcanvas.com/en/user-manual/graphics/lighting/lightmaps/#lightmap-size-multipliers'
    }, {
        name: 'layers',
        title: 'layers',
        subTitle: '{Number[]}',
        description: 'The layers that this model belongs to. When a model belongs to multiple layers it will be rendered multiple times.',
        url: 'http://developer.playcanvas.com/api/pc.ModelComponent.html#layers'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'model:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-particlesystem-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.ParticleSystemComponent',
        subTitle: '{pc.Component}',
        description: 'Used to simulate particles and produce renderable particle mesh in scene.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html'
    }, {
        title: 'autoPlay',
        subTitle: '{Boolean}',
        description: 'If checked, the particle system will play immediately on creation. If this option is left unchecked, you will need to call the particle system component\'s play function from script.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#autoPlay'
    }, {
        title: 'alignToMotion',
        subTitle: '{Boolean}',
        description: 'Orient particle in their direction of motion.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#alignToMotion'
    }, {
        title: 'alphaGraph',
        subTitle: '{pc.Curve}',
        description: 'A curve defining how each particle\'s opacity changes over time. If two curves are specified in the curve editor, the opacity will be a random lerp between both curves.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#alphaGraph'
    }, {
        name: 'animTiles',
        title: 'animTilesX / animTilesY',
        subTitle: '{Number}',
        description: 'Number of horizontal / vertical tiles in the sprite sheet',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#animTilesX'

    }, {
        title: 'animTilesX',
        subTitle: '{Number}',
        description: 'Number of horizontal tiles in the sprite sheet',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#animTilesX'
    }, {
        title: 'animTilesY',
        subTitle: '{Number}',
        description: 'Number of vertical tiles in the sprite sheet',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#animTilesY'
    }, {
        title: 'animStartFrame',
        subTitle: '{Number}',
        description: 'Sprite sheet frame to begin animation from',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#animStartFrame'
    }, {
        title: 'animNumFrames',
        subTitle: '{Number}',
        description: 'Number of sprite sheet frames to play',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#animNumFrames'
    }, {
        title: 'animSpeed',
        subTitle: '{Number}',
        description: 'Sprite sheet animation speed. 1 = particle lifetime, 2 = twice during lifetime etc...',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#animSpeed'
    }, {
        title: 'animLoop',
        subTitle: '{Boolean}',
        description: 'If true then the sprite sheet animation will repeat indefinitely',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#animLoop'
    }, {
        title: 'blend',
        subTitle: '{pc.BLEND_*}',
        description: 'The blending mode determines how particles are composited when they are written to the frame buffer. Let\'s consider that Prgb is the RGB color of a particle\'s pixel, Pa is its alpha value, and Drgb is the RGB color already in the frame buffer.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#blend'
    }, {
        title: 'colorGraph',
        subTitle: '{pc.CurveSet}',
        description: 'A curve defining how each particle\'s color changes over time.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#colorGraph'
    }, {
        title: 'colorMap',
        subTitle: '{pc.Texture}',
        description: 'The color map texture to apply to all particles in the system. If no texture asset is assigned, a default spot texture is used.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#colorMap'
    }, {
        title: 'orientation',
        subTitle: '{pc.PARTICLEORIENTATION_*}',
        description: 'Orientation mode controls particle planes facing. The options are: Screen: Particles are facing camera. World Normal: User defines world space normal to set planes orientation. Emitter Normal: Similar to previous, but the normal is affected by emitter(entity) transformation.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#orientation'
    }, {
        title: 'particleNormal',
        subTitle: '{pc.Vec3}',
        description: 'Either world or emitter space vector to define particle plane orientation.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#particleNormal'
    }, {
        title: 'depthSoftening',
        subTitle: '{Number}',
        description: 'This variable value determines how much particles fade out as they get closer to another surface. This avoids the situation where particles appear to cut into surfaces.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#depthSoftening'
    }, {
        title: 'depthWrite',
        subTitle: '{Boolean}',
        description: 'If checked, the particles will write depth information to the depth buffer. If unchecked, the depth buffer is left unchanged and particles will be guaranteed to overwrite one another in the order in which they are rendered.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#depthWrite'
    }, {
        title: 'emitterExtents',
        subTitle: '{pc.Vec3}',
        description: 'The half extents of a local space bounding box within which particles are spawned at random positions.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#emitterExtents'
    }, {
        title: 'emitterExtentsInner',
        subTitle: '{pc.Vec3}',
        description: 'The exception volume of a local space bounding box within which particles are not spawned.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#emitterExtents'
    }, {
        title: 'emitterRadius',
        subTitle: '{Number}',
        description: 'The radius within which particles are spawned at random positions.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#emitterRadius'
    }, {
        title: 'emitterRadiusInner',
        subTitle: '{Number}',
        description: 'The inner sphere radius within which particles are not spawned',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#emitterRadius'
    }, {
        title: 'emitterShape',
        subTitle: '{pc.EMITTERSHAPE_*}',
        description: 'Shape of the emitter. Can be: pc.EMITTERSHAPE_BOX, pc.EMITTERSHAPE_SPHERE.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#emitterShape'
    }, {
        title: 'halfLambert',
        subTitle: '{Boolean}',
        description: 'Enabling Half Lambert lighting avoids particles looking too flat when lights appear to be shining towards the back sides of the particles. It is a completely non-physical lighting model but can give more pleasing visual results. This option is only available when Lighting is enabled.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#halfLambert'
    }, {
        title: 'intensity',
        subTitle: '{Number}',
        description: 'Scales the color of particles to allow them to have arbitrary brightness.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#intensity'
    }, {
        title: 'lifetime',
        subTitle: '{Number}',
        description: 'The length of time in seconds between a particle\'s birth and its death.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#lifetime'
    }, {
        title: 'lighting',
        subTitle: '{Boolean}',
        description: 'If checked, the particle will be lit by the directional and ambient light in the scene. In some circumstances, it may be advisable to set a normal map on the particle system in order to achieve more realistic lighting.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#lighting'
    }, {
        title: 'localVelocityGraph',
        subTitle: '{pc.CurveSet}',
        description: 'A curve defining how each particle\'s velocity with respect to the particle system\'s local coordinate system changes over time. If two curves are specified in the curve editor, local velocity will be a random lerp between both curves.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#localVelocityGraph'
    }, {
        title: 'loop',
        subTitle: '{Boolean}',
        description: 'If checked, the particle system will emit indefinitely. Otherwise, it will emit the number of particles specified by the \'Particle Count\' property and then stop.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#loop'
    }, {
        title: 'mesh',
        subTitle: '{pc.Mesh}',
        description: 'A model asset. The first mesh found in the model is used to represent all particles rather than a flat billboard.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#mesh'
    }, {
        title: 'normalMap',
        subTitle: '{pc.Texture}',
        description: 'The normal map texture to apply to all particles in the system. Applying a normal map can make billboard particles appear more consistent with the scenes lighting.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#normalMap'
    }, {
        title: 'numParticles',
        subTitle: '{Number}',
        description: 'The maximum number of particles managed by this particle system.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#numParticles'
    }, {
        title: 'paused',
        subTitle: '{Boolean}',
        description: 'Pauses or unpauses the simulation.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#paused'
    }, {
        title: 'preWarm',
        subTitle: '{Boolean}',
        description: 'If enabled, the particle system will be initialized as though it had already completed a full cycle. This option is only available for looping particle systems.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#preWarm'
    }, {
        title: 'rate',
        subTitle: '{Number}',
        description: 'The bounds of the time range defining the interval in seconds between particle births. The time for the next particle emission will be chosen at random between rate and rate2.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#rate'
    }, {
        title: 'localSpace',
        subTitle: '{Boolean}',
        description: 'Binds particles to emitter node transformation.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#localSpace'
    }, {
        title: 'rotationSpeedGraph',
        subTitle: '{pc.Curve}',
        description: 'A curve defining how each particle\'s angular velocity changes over time. If two curves are specified in the curve editor, the angular velocity will be a random lerp between both curves.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#rotationSpeedGraph'
    }, {
        title: 'scaleGraph',
        subTitle: '{pc.Curve}',
        description: 'A curve defining how each particle\'s scale changes over time. By default, a particle is 1 unit in width and height. If two curves are specified in the curve editor, the scale will be a random lerp between both curves.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#scaleGraph'
    }, {
        title: 'radialSpeedGraph',
        subTitle: '{pc.Curve}',
        description: 'A curve defining how particle\'s radial speed changes over time. Individual particle radial velocity points from emitter origin to particle current position. If two curves are specified in the curve editor, the value will be a random between both curves.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#radialSpeedGraph'
    }, {
        title: 'sort',
        subTitle: '{pc.PARTICLESORT_*}',
        description: 'Sorting mode gives you control over the order in which particles are rendered. The options are: None: Particles are rendered in arbitrary order. When this option is selected, the particle system is simulated on the GPU (if the underlying hardware supports floating point textures) and it is recommended you use this setting to get the best performance. Camera Distance: Particles are sorted on the CPU and rendered in back to front order (in terms of camera z depth). Newer First: Particles are sorted on the CPU and rendered in age order, youngest first. Older First: Particles are sorted on the CPU and rendered in age order, oldest first.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#sort'
    }, {
        title: 'startAngle',
        subTitle: '{Number}',
        description: 'The bounds of the initial particle rotation specified in degrees. For each particle, this angle is chosen at random between startAngle and startAngle2.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#startAngle'
    }, {
        title: 'stretch',
        subTitle: '{Number}',
        description: 'A value in world units that controls the amount by which particles are stretched based on their velocity. Particles are stretched from their center towards their previous position.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#stretch'
    }, {
        title: 'velocityGraph',
        subTitle: '{pc.CurveSet}',
        description: 'A curve defining how each particle\'s velocity with respect to the world coordinate system changes over time. If two curves are specified in the curve editor, velocity will be a random lerp between both curves.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#velocityGraph'
    }, {
        title: 'wrap',
        subTitle: '{Boolean}',
        description: 'Enables wrap bounds.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#wrap'
    }, {
        title: 'wrapBounds',
        subTitle: '{pc.Vec3}',
        description: 'World space AABB volume centered on the owner entity\'s position. If a particle crosses the boundary of one side of the volume, it teleports to the opposite side. You can use this to make environmental effects like rain by moving a wrapped emitter\'s owner entity.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#wrapBounds'
    }, {
        name: 'layers',
        title: 'layers',
        subTitle: '{Number[]}',
        description: 'The layers that this particle sytem belongs to. When a particle system belongs to multiple layers it will be rendered multiple times.',
        url: 'http://developer.playcanvas.com/api/pc.ParticleSystemComponent.html#layers'
    }];

    for (var i = 0; i < fields.length; i++) {
        if (fields[i].title === 'animStartFrame' && !editor.call('users:hasFlag', 'hasParticleSystemAnimStartFrame'))
            continue;
        fields[i].name = 'particlesystem:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-rigidbody-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.RigidBodyComponent',
        subTitle: '{pc.Component}',
        description: 'The rigidbody Component, when combined with a pc.CollisionComponent, allows your Entities to be simulated using realistic physics. A rigidbody Component will fall under gravity and collide with other rigid bodies, using scripts you can apply forces to the body.',
        url: 'http://developer.playcanvas.com/api/pc.RigidBodyComponent.html'
    }, {
        title: 'linearDamping',
        subTitle: '{Number}',
        description: 'Controls the rate at which a body loses linear velocity over time.',
        url: 'http://developer.playcanvas.com/api/pc.RigidBodyComponent.html#linearDamping'
    }, {
        title: 'angularDamping',
        subTitle: '{Number}',
        description: 'Controls the rate at which a body loses angular velocity over time.',
        url: 'http://developer.playcanvas.com/api/pc.RigidBodyComponent.html#angularDamping'
    }, {
        title: 'angularFactor',
        subTitle: '{pc.Vec3}',
        description: 'Scaling factor for angular movement of the body in each axis.',
        url: 'http://developer.playcanvas.com/api/pc.RigidBodyComponent.html#angularFactor'
    }, {
        title: 'friction',
        subTitle: '{Number}',
        description: 'The friction value used when contacts occur between two bodies.',
        url: 'http://developer.playcanvas.com/api/pc.RigidBodyComponent.html#friction'
    }, {
        title: 'group',
        subTitle: '{Number}',
        description: 'description',
        url: 'http://developer.playcanvas.com/api/pc.RigidBodyComponent.html#group'
    }, {
        title: 'linearFactor',
        subTitle: '{pc.Vec3}',
        description: 'Scaling factor for linear movement of the body in each axis.',
        url: 'http://developer.playcanvas.com/api/pc.RigidBodyComponent.html#linearFactor'
    }, {
        title: 'mass',
        subTitle: '{Number}',
        description: 'The mass of the body.',
        url: 'http://developer.playcanvas.com/api/pc.RigidBodyComponent.html#mass'
    }, {
        title: 'restitution',
        subTitle: '{Number}',
        description: 'The amount of energy lost when two objects collide, this determines the bounciness of the object.',
        url: 'http://developer.playcanvas.com/api/pc.RigidBodyComponent.html#restitution'
    }, {
        title: 'type',
        subTitle: '{pc.RIGIDBODY_TYPE_*}',
        description: 'The type of RigidBody determines how it is simulated.',
        url: 'http://developer.playcanvas.com/api/pc.RigidBodyComponent.html#type'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'rigidbody:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-script-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.ScriptComponent',
        subTitle: '{pc.Component}',
        description: 'The ScriptComponent allows you to extend the functionality of an Entity by attaching your own javascript files to be executed with access to the Entity. For more details on scripting see Scripting.',
        url: 'http://developer.playcanvas.com/api/pc.ScriptComponent.html'
    }, {
        title: 'scripts',
        subTitle: '{Object[]}',
        description: 'Add scripts by clicking on the button or drag scripts on the script component.',
        url: 'http://developer.playcanvas.com/api/pc.ScriptComponent.html#scripts'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'script:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-screen-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.ScreenComponent',
        subTitle: '{pc.Component}',
        description: '',
        url: 'http://developer.playcanvas.com/api/pc.ScreenComponent.html'
    }, {
        title: 'screenSpace',
        subTitle: '{Boolean}',
        description: 'If true then the screen will display its child Elements in 2D. Set this to false to make this a 3D screen.',
        url: 'http://developer.playcanvas.com/api/pc.ScreenComponent.html#screenSpace'
    }, {
        title: 'resolution',
        subTitle: '{pc.Vec2}',
        description: 'The resolution of the screen.',
        url: 'http://developer.playcanvas.com/api/pc.ScreenComponent.html#resolution'
    }, {
        title: 'referenceResolution',
        subTitle: '{pc.Vec2}',
        description: 'The reference resolution of the screen. If the window size changes the screen will adjust its size based on scaleMode using the reference resolution.',
        url: 'http://developer.playcanvas.com/api/pc.ScreenComponent.html#referenceResolution'
    }, {
        title: 'scaleMode',
        subTitle: '{String}',
        description: 'Controls how a screen-space screen is resized when the window size changes. Use Blend to have the screen adjust between the difference of the window resolution and the screen\'s reference resolution. Use None to make the screen always have a size equal to its resolution.',
        url: 'http://developer.playcanvas.com/api/pc.ScreenComponent.html#scaleMode'
    }, {
        title: 'scaleBlend',
        subTitle: '{Number}',
        description: 'Set this to 0 to only adjust to changes between the width of the window and the x of the reference resolution. Set this to 1 to only adjust to changes between the window height and the y of the reference resolution. A value in the middle will try to adjust to both.',
        url: 'http://developer.playcanvas.com/api/pc.ScreenComponent.html#scaleBlend'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'screen:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-element-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.ElementComponent',
        subTitle: '{pc.Component}',
        description: '',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html'
    }, {
        title: 'type',
        subTitle: '{String}',
        description: 'The type of the Element.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#type'
    }, {
        title: 'preset',
        subTitle: 'Anchor / Pivot preset',
        description: 'Quickly change the anchor and the pivot of the Element to common presets.'
    }, {
        title: 'anchor',
        subTitle: '{pc.Vec4}',
        description: 'The left, bottom, right and top anchors of the Element. These range from 0 to 1. If the horizontal or vertical anchors are split (not equal) then the Element will grow to fill the difference.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#anchor'
    }, {
        title: 'pivot',
        subTitle: '{pc.Vec2}',
        description: 'The origin of the Element. Rotation and scaling is done based on the pivot.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#pivot'
    }, {
        title: 'text',
        subTitle: '{String}',
        description: 'The text content of the Element. Hit Shift+Enter to add new lines.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#text'
    }, {
        title: 'key',
        subTitle: '{String}',
        description: 'The localization key of the Element. Hit Shift+Enter to add new lines.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#key'
    }, {
        name: 'localized',
        title: 'Localized',
        description: 'Enable this to set the localization key of the Element. The localization key will be used to get the translation of the element\'s text at runtime.'
    }, {
        title: 'fontAsset',
        subTitle: '{pc.Asset}',
        description: 'The font asset used by the Element.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#fontAsset'
    }, {
        title: 'textureAsset',
        subTitle: '{pc.Asset}',
        description: 'The texture to be used by the Element.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#textureAsset'
    }, {
        title: 'spriteAsset',
        subTitle: '{pc.Asset}',
        description: 'The sprite to be used by the Element.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#spriteAsset'
    }, {
        title: 'spriteFrame',
        subTitle: '{Number}',
        description: 'The frame from the Sprite Asset to render.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#spriteFrame'
    }, {
        title: 'pixelsPerUnit',
        subTitle: '{Number}',
        description: 'The number of pixels that correspond to one PlayCanvas unit. Used when using 9 Sliced Sprite Assets to control the thickness of the borders. If this value is not specified the Element component will use the pixelsPerUnit value from the Sprite Asset.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#pixelsPerUnit'
    }, {
        title: 'materialAsset',
        subTitle: '{pc.Asset}',
        description: 'The material to be used by the element.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#materialAsset'
    }, {
        title: 'autoWidth',
        subTitle: '{Booelan}',
        description: 'Make the width of the element match the width of the text content automatically.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#autoWidth'
    }, {
        title: 'autoHeight',
        subTitle: '{Booelan}',
        description: 'Make the height of the element match the height of the text content automatically.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#autoHeight'
    }, {
        title: 'autoFitWidth',
        subTitle: '{Boolean}',
        description: 'If enabled then the font size and the line height of the Element will scale automatically so that it fits the Element\'s width. The value of this field will be ignored if autoWidth is enabled. The font size will scale between the values of minFontSize and fontSize. The lineHeight will scale proportionately.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#autoFitWidth'
    }, {
        title: 'autoFitHeight',
        subTitle: '{Boolean}',
        description: 'If enabled then the font size of the Element will scale automatically so that it fits the Element\'s height. The value of this field will be ignored if autoHeight is enabled. The font size will scale between the values of minFontSize and fontSize. The lineHeight will scale proportionately.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#autoFitHeight'
    }, {
        title: 'autoHeight',
        subTitle: '{Booelan}',
        description: 'Make the height of the element match the height of the text content automatically.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#autoHeight'
    }, {
        title: 'size',
        subTitle: 'width / height {Number}',
        description: 'The width and height of the Element. You can only edit the width or the height if the corresponding anchors of the Element are not split.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#width'
    }, {
        title: 'width',
        description: 'The width of the Element. You can only edit the width if the corresponding anchors of the Element are not split.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#width'
    }, {
        title: 'height',
        description: 'The height of the Element. You can only edit the height if the corresponding anchors of the Element are not split.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#height'
    }, {
        title: 'margin',
        subTitle: 'margin {pc.Vec4}',
        description: 'Controls the spacing between each edge of the Element and the respective anchor. You can only edit the margin if the related anchors are split.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#margin'
    }, {
        title: 'alignment',
        subTitle: 'alignment {pc.Vec2}',
        description: 'Controls the horizontal and vertical alignment of the text relative to its element transform.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#alignment'
    }, {
        title: 'rect',
        subTitle: '{pc.Vec4}',
        description: 'The u, v, width and height of the rectangle that represents the portion of the texture that this image maps to.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#rect'
    }, {
        title: 'fontSize',
        subTitle: '{Number}',
        description: 'The size of the font used by the Element. When autoFitWidth or autoFitHeight are true then it scales between minFontSize and maxFontSize depending on the size of the Element.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#fontSize'
    }, {
        title: 'minFontSize',
        subTitle: '{Number}',
        description: 'The minimum size of the font that the Element can scale to when using autoFitWidth or autoFitHeight.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#fontSize'
    }, {
        title: 'maxFontSize',
        subTitle: '{Number}',
        description: 'The maximum size of the font that the Element can scale to when using autoFitWidth or autoFitHeight.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#fontSize'
    }, {
        title: 'lineHeight',
        subTitle: '{Number}',
        description: 'The height of each line of text. If autoFitWidth or autoFitHeight are enabled then the lineHeight will scale with the font.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#lineHeight'
    }, {
        title: 'wrapLines',
        subTitle: '{Boolean}',
        description: 'Whether to automatically wrap lines based on the element width.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#wrapLines'
    }, {
        title: 'maxLines',
        subTitle: '{Number}',
        description: 'The maximum number of lines that this Element can display. Any left-over text will be appended to the last line of the Element. You can delete this value if you wish to have unlimited lines.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#maxLines'
    }, {
        title: 'spacing',
        subTitle: '{Number}',
        description: 'The spacing between each letter of the text.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#spacing'
    }, {
        title: 'color',
        subTitle: '{pc.Color}',
        description: 'The color of the Element.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#color'
    }, {
        title: 'opacity',
        subTitle: '{Number}',
        description: 'The opacity of the Element.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#opacity'
    }, {
        title: 'useInput',
        subTitle: '{Boolean}',
        description: 'Enable this if you want the element to receive input events.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#useInput'
    }, {
        title: 'batchGroupId',
        subTitle: '{Number}',
        description: 'The batch group that this Element belongs to. The engine will attempt to batch Elements in the same batch group to reduce draw calls.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#batchGroupId'
    }, {
        name: 'layers',
        title: 'layers',
        subTitle: '{Number[]}',
        description: 'The layers that this Element belongs to. When an Element belongs to multiple layers it will be rendered multiple times.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#layers'
    }, {
        title: 'outlineColor',
        subTitle: '{pc.Color}',
        description: 'The text outline effect color and opacity.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#outlineColor'
    }, {
        title: 'outlineThickness',
        subTitle: '{Number}',
        description: 'The text outline effect width. These range from 0 to 1. To disable outline effect set to 0.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#outlineThickness'
    }, {
        title: 'shadowColor',
        subTitle: '{pc.Color}',
        description: 'The text shadow cast effect color and opacity.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#shadowColor'
    }, {
        title: 'shadowOffset',
        subTitle: '{pc.Vec2}',
        description: 'Controls the horizontal and vertical shift of the text shadow cast effect. The rage of both components is form -1 to 1. To disable effect set both to 0.',
        url: 'http://developer.playcanvas.com/api/pc.ElementComponent.html#shadowOffset'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'element:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-button-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.ButtonComponent',
        subTitle: '{pc.Component}',
        description: 'A ButtonComponent enables a group of entities to behave like a button, with different visual states for hover and press interactions.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html'
    }, {
        title: 'active',
        subTitle: '{Boolean}',
        description: 'If set to false, the button will be visible but will not respond to hover or touch interactions.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#active'
    }, {
        title: 'imageEntity',
        subTitle: '{pc.Entity}',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#imageEntity',
        description: 'A reference to the entity to be used as the button background. The entity must have an ImageElement component.'
    }, {
        title: 'hitPadding',
        subTitle: '{pc.Vec4}',
        description: 'Padding to be used in hit-test calculations. Can be used to expand the bounding box so that the button is easier to tap.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#hitPadding'
    }, {
        title: 'transitionMode',
        subTitle: '{pc.BUTTON_TRANSITION_MODE}',
        description: 'Controls how the button responds when the user hovers over it/presses it.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#transitionMode'
    }, {
        title: 'hoverTint',
        subTitle: '{pc.Color}',
        description: 'Color to be used on the button image when the user hovers over it.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#hoverTint'
    }, {
        title: 'pressedTint',
        subTitle: '{pc.Color}',
        description: 'Color to be used on the button image when the user presses it.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#pressedTint'
    }, {
        title: 'inactiveTint',
        subTitle: '{pc.Color}',
        description: 'Color to be used on the button image when the button is not interactive.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#inactiveTint'
    }, {
        title: 'fadeDuration',
        subTitle: '{Number}',
        description: 'Duration to be used when fading between tints, in milliseconds.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#fadeDuration'
    }, {
        title: 'hoverSpriteAsset',
        subTitle: '{pc.Asset}',
        description: 'Sprite to be used as the button image when the user hovers over it.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#hoverSpriteAsset'
    }, {
        title: 'hoverSpriteFrame',
        subTitle: '{Number}',
        description: 'Frame to be used from the hover sprite.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#hoverSpriteFrame'
    }, {
        title: 'pressedSpriteAsset',
        subTitle: '{pc.Asset}',
        description: 'Sprite to be used as the button image when the user presses it.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#pressedSpriteAsset'
    }, {
        title: 'pressedSpriteFrame',
        subTitle: '{Number}',
        description: 'Frame to be used from the pressed sprite.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#pressedSpriteFrame'
    }, {
        title: 'inactiveSpriteAsset',
        subTitle: '{pc.Asset}',
        description: 'Sprite to be used as the button image when the button is not interactive.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#inactiveSpriteAsset'
    }, {
        title: 'inactiveSpriteFrame',
        subTitle: '{Number}',
        description: 'Frame to be used from the inactive sprite.',
        url: 'http://developer.playcanvas.com/api/pc.ButtonComponent.html#inactiveSpriteFrame'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'button:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-scroll-view-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.ScrollViewComponent',
        subTitle: '{pc.Component}',
        description: 'A ScrollViewComponent enables a group of entities to behave like a masked scrolling area, with optional horizontal and vertical scroll bars.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollViewComponent.html'
    }, {
        title: 'horizontal',
        subTitle: '{Boolean}',
        description: 'Whether to enable horizontal scrolling.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollViewComponent.html#horizontal'
    }, {
        title: 'vertical',
        subTitle: '{Boolean}',
        description: 'Whether to enable vertical scrolling.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollViewComponent.html#vertical'
    }, {
        title: 'scrollMode',
        subTitle: '{pc.SCROLL_MODE}',
        description: 'Specifies how the scroll view should behave when the user scrolls past the end of the content.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollViewComponent.html#scrollMode'
    }, {
        title: 'bounceAmount',
        subTitle: '{Number}',
        description: 'Controls how far the content should move before bouncing back.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollViewComponent.html#bounceAmount'
    }, {
        title: 'friction',
        subTitle: '{Number}',
        description: 'Controls how freely the content should move if thrown, i.e. by flicking on a phone or by flinging the scroll wheel on a mouse. A value of 1 means that content will stop immediately; 0 means that content will continue moving forever (or until the bounds of the content are reached, depending on the scrollMode).',
        url: 'http://developer.playcanvas.com/api/pc.ScrollViewComponent.html#friction'
    }, {
        title: 'horizontalScrollbarVisibility',
        subTitle: '{pc.SCROLLBAR_VISIBILITY}',
        description: 'Controls whether the horizontal scrollbar should be visible all the time, or only visible when the content exceeds the size of the viewport.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollViewComponent.html#horizontalScrollbarVisibility'
    }, {
        title: 'verticalScrollbarVisibility',
        subTitle: '{pc.SCROLLBAR_VISIBILITY}',
        description: 'Controls whether the vertical scrollbar should be visible all the time, or only visible when the content exceeds the size of the viewport.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollViewComponent.html#verticalScrollbarVisibility'
    }, {
        title: 'viewportEntity',
        subTitle: '{pc.Entity}',
        description: 'The entity to be used as the masked viewport area, within which the content will scroll. This entity must have an ElementGroup component.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollViewComponent.html#viewportEntity'
    }, {
        title: 'contentEntity',
        subTitle: '{pc.Entity}',
        description: 'The entity which contains the scrolling content itself. This entity must have an Element component.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollViewComponent.html#contentEntity'
    }, {
        title: 'horizontalScrollbarEntity',
        subTitle: '{pc.Entity}',
        description: 'The entity to be used as the horizontal scrollbar. This entity must have a Scrollbar component.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollViewComponent.html#horizontalScrollbarEntity'
    }, {
        title: 'verticalScrollbarEntity',
        subTitle: '{pc.Entity}',
        description: 'The entity to be used as the vertical scrollbar. This entity must have a Scrollbar component.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollViewComponent.html#verticalScrollbarEntity'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'scrollview:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-scrollbar-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.ScrollbarComponent',
        subTitle: '{pc.Component}',
        description: 'A ScrollbarComponent enables a group of entities to behave like a scrollbar, with different visual states for hover and press interactions.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollbarComponent.html'
    }, {
        title: 'orientation',
        subTitle: '{pc.ORIENTATION}',
        description: 'Whether the scrollbar moves horizontally or vertically.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollbarComponent.html#orientation'
    }, {
        title: 'handleEntity',
        subTitle: '{pc.Entity}',
        description: 'The entity to be used as the scrollbar handle. This entity must have a Scrollbar component.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollbarComponent.html#handleEntity'
    }, {
        title: 'value',
        subTitle: '{Number}',
        description: 'The current position value of the scrollbar, in the range 0...1.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollbarComponent.html#value'
    }, {
        title: 'handleSize',
        subTitle: '{Number}',
        description: 'The size of the handle relative to the size of the track, in the range 0...1. For a vertical scrollbar, a value of 1 means that the handle will take up the full height of the track.',
        url: 'http://developer.playcanvas.com/api/pc.ScrollbarComponent.html#handleSize'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'scrollbar:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-sprite-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.SpriteComponent',
        subTitle: '{pc.Component}',
        description: 'The Sprite Component enables an Entity to render a simple static Sprite or Sprite Animation Clips.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html'
    }, {
        title: 'type',
        subTitle: '{Boolean}',
        description: 'A Sprite Component can either be Simple or Animated. Simple Sprite Components only show a single frame of a Sprite Asset. Animated Sprite Components can play Sprite Animation Clips.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#type'
    }, {
        title: 'color',
        subTitle: '{pc.Color}',
        description: 'The color tint of the Sprite.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#color'
    }, {
        title: 'opacity',
        subTitle: '{Number}',
        description: 'The opacity of the Sprite.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#opacity'
    }, {
        title: 'spriteAsset',
        subTitle: '{pc.Asset}',
        description: 'The Sprite Asset used by the Sprite Component.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#spriteAsset'
    }, {
        title: 'frame',
        subTitle: '{Number}',
        description: 'The frame of the Sprite Asset that the Sprite Component will render.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#frame'
    }, {
        title: 'flipX',
        subTitle: '{Boolean}',
        description: 'Flips the X axis when rendering a Sprite.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#flipX'
    }, {
        title: 'flipY',
        subTitle: '{Boolean}',
        description: 'Flips the Y axis when rendering a Sprite.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#flipY'
    }, {
        title: 'size',
        subTitle: 'width / height {Number}',
        description: 'The width and height of the Sprite when rendering using 9-Slicing. The width and height are only used when the render mode of the Sprite Asset is Sliced or Tiled.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#width'
    }, {
        title: 'width',
        subTitle: '{Number}',
        description: 'The width of the Sprite when rendering using 9-Slicing. The width is only used when the render mode of the Sprite Asset is Sliced or Tiled.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#width'
    }, {
        title: 'height',
        subTitle: '{Number}',
        description: 'The height of the Sprite when rendering using 9-Slicing. The height is only used when the render mode of the Sprite Asset is Sliced or Tiled.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#height'
    }, {
        title: 'drawOrder',
        subTitle: '{Number}',
        description: 'The draw order of the sprite. A higher value means that the component will be rendered on top of other components in the same layer. For this work the sprite must be in a layer that uses Manual sort order.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#drawOrder'
    }, {
        title: 'speed',
        subTitle: '{Number}',
        description: 'A global speed modifier used when playing Sprite Animation Clips.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#flipY'
    }, {
        title: 'autoPlayClip',
        subTitle: '{String}',
        description: 'The Sprite Animation Clip to play automatically when the Sprite Component is enabled.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#autoPlayClip'
    }, {
        title: 'batchGroupId',
        subTitle: '{Number}',
        description: 'The batch group that this sprite belongs to. The engine will attempt to batch sprites in the same batch group to reduce draw calls.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#batchGroupId'
    }, {
        name: 'addClip',
        title: 'Add Clip',
        description: 'Add a new Sprite Animation Clip.'
    }, {
        name: 'layers',
        title: 'layers',
        subTitle: '{Number[]}',
        description: 'The layers that this sprite belongs to. When a sprite belongs to multiple layers it will be rendered multiple times.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteComponent.html#layers'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'sprite:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-sprite-animation-clip-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'clip',
        title: 'pc.SpriteAnimationClip',
        description: 'A Sprite Animation Clip can play all the frames of a Sprite Asset at a specified speed.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteAnimationClip.html'
    }, {
        title: 'name',
        subTitle: '{String}',
        description: 'The name of the animation clip. The name of the clip must be unique for this Sprite Component.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteAnimationClip.html#name'
    }, {
        title: 'autoPlay',
        subTitle: '{Boolean}',
        description: 'Enable this if you want to automatically start playing this animation clip as soon as it is loaded.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteAnimationClip.html#autoPlay'
    }, {
        title: 'loop',
        subTitle: '{Boolean}',
        description: 'Enable this if you want to loop the animation clip.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteAnimationClip.html#loop'
    }, {
        title: 'fps',
        subTitle: '{Number}',
        description: 'The number of frames per second to play for this animation clip.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteAnimationClip.html#fps'
    }, {
        title: 'spriteAsset',
        subTitle: '{pc.Asset}',
        description: 'The Sprite Asset that contains all the frames of the animation clip.',
        url: 'http://developer.playcanvas.com/api/pc.SpriteAnimationClip.html#spriteAsset'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'spriteAnimation:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-layoutgroup-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.LayoutGroupComponent',
        subTitle: '{pc.Component}',
        description: 'The Layout Group Component enables an Entity to position and scale child Element Components according to configurable layout rules.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutGroupComponent.html'
    }, {
        title: 'orientation',
        subTitle: '{pc.ORIENTATION}',
        description: 'Whether the layout should run horizontally or vertically.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutGroupComponent.html#orientation'
    }, {
        title: 'reverseX',
        subTitle: '{Boolean}',
        description: 'Reverses the order of elements on the X axis.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutGroupComponent.html#reverseX'
    }, {
        title: 'reverseY',
        subTitle: '{Boolean}',
        description: 'Reverses the order of elements on the Y axis.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutGroupComponent.html#reverseY'
    }, {
        title: 'alignment',
        subTitle: '{pc.Vec2}',
        description: 'Specifies the horizontal and vertical alignment of child elements. Values range from 0 to 1 where [0,0] is the bottom left and [1,1] is the top right.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutGroupComponent.html#alignment'
    }, {
        title: 'padding',
        subTitle: '{pc.Vec4}',
        description: 'Padding to be applied inside the container before positioning any children. Specified as left, bottom, right and top values.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutGroupComponent.html#padding'
    }, {
        title: 'spacing',
        subTitle: '{pc.Vec2}',
        description: 'Spacing to be applied between each child element.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutGroupComponent.html#spacing'
    }, {
        title: 'widthFitting',
        subTitle: '{pc.FITTING}',
        description: 'Fitting logic to be applied when positioning and scaling child elements.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutGroupComponent.html#widthFitting'
    }, {
        title: 'heightFitting',
        subTitle: '{pc.FITTING}',
        description: 'Fitting logic to be applied when positioning and scaling child elements.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutGroupComponent.html#heightFitting'
    }, {
        title: 'wrap',
        subTitle: '{Boolean}',
        description: 'Whether or not to wrap children onto a new row/column when the size of the container is exceeded.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutGroupComponent.html#wrap'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'layoutgroup:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-components-layoutchild-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'component',
        title: 'pc.LayoutChildComponent',
        subTitle: '{pc.Component}',
        description: 'The Layout Child Component enables an Entity to control the sizing applied to it by its parent Layout Group Component.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutChildComponent.html'
    }, {
        title: 'minWidth',
        subTitle: '{Number}',
        description: 'The minimum width the element should be rendered at.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutChildComponent.html#minWidth'
    }, {
        title: 'minHeight',
        subTitle: '{Number}',
        description: 'The minimum height the element should be rendered at.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutChildComponent.html#minHeight'
    }, {
        title: 'maxWidth',
        subTitle: '{Number}',
        description: 'The maximum width the element should be rendered at.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutChildComponent.html#maxWidth'
    }, {
        title: 'maxHeight',
        subTitle: '{Number}',
        description: 'The maximum height the element should be rendered at.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutChildComponent.html#maxHeight'
    }, {
        title: 'fitWidthProportion',
        subTitle: '{Number}',
        description: 'The amount of additional horizontal space that the element should take up, if necessary to satisfy a Stretch/Shrink fitting calculation. This is specified as a proportion, taking into account the proportion values of other siblings.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutChildComponent.html#fitWidthProportion'
    }, {
        title: 'fitHeightProportion',
        subTitle: '{Number}',
        description: 'The amount of additional vertical space that the element should take up, if necessary to satisfy a Stretch/Shrink fitting calculation. This is specified as a proportion, taking into account the proportion values of other siblings.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutChildComponent.html#fitHeightProportion'
    }, {
        title: 'excludeFromLayout',
        subTitle: '{Boolean}',
        description: 'When enabled, the child will be excluded from all layout calculations.',
        url: 'http://developer.playcanvas.com/api/pc.LayoutChildComponent.html#excludeFromLayout'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'layoutchild:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        title: 'id',
        subTitle: '{Number}',
        description: 'Unique identifier of an Asset.',
        url: 'http://developer.playcanvas.com/api/pc.Asset.html'
    }, {
        title: 'name',
        subTitle: '{String}',
        description: 'The name of the asset.',
        url: 'http://developer.playcanvas.com/api/pc.Asset.html#name'
    }, {
        title: 'type',
        subTitle: '{String}',
        description: 'The type of the asset. One of: animation, audio, image, json, material, model, text, texture.',
        url: 'http://developer.playcanvas.com/api/pc.Asset.html#type'
    }, {
        name: 'size',
        description: 'Size of an asset. Keeping this value as tiny as possible will lead to faster application loading and less bandwidth required to launch the app.'
    }, {
        title: 'tags',
        subTitle: '{pc.Tags}',
        description: 'Interface for tagging assets. Allows to find assets by tags using app.assets.findByTag method.',
        url: 'http://developer.playcanvas.com/api/pc.Asset.html#tags'
    }, {
        name: 'runtime',
        description: 'If this asset is runtime-friendly and can be used within the app.'
    }, {
        title: 'preload',
        subTitle: '{Boolean}',
        description: 'If true the asset will be loaded during the preload phase of application set up.',
        url: 'http://developer.playcanvas.com/api/pc.Asset.html#preload'
    }, {
        name: 'source',
        description: 'Reference to another asset where this asset were imported from.'
    }, {
        name: 'bundles',
        description: 'If the asset is included in any Asset Bundles then these are listed here. You can also add the asset to an Asset Bundle by using the dropdown.'
    }, {
        name: 'localization',
        title: 'LOCALIZATION',
        description: 'Here you can define a replacement asset to be used for a particular locale. When the application\'s locale changes then references to this asset will use the replacement asset for the new locale.'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-audio-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'asset',
        title: 'pc.Sound',
        subTitle: '{Class}',
        description: 'Audio resource file that is used by Web Audio API.',
        url: 'http://developer.playcanvas.com/api/pc.Sound.html'
    }, {
        title: 'duration',
        subTitle: '{Number}',
        description: 'Duration of the audio file in seconds.',
        url: 'http://developer.playcanvas.com/api/pc.Sound.html#duration'
    }];

    // fields reference
    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:audio:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-animation-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'asset',
        title: 'pc.Animation',
        subTitle: '{Class}',
        description: 'An animation is a sequence of keyframe arrays which map to the nodes of a skeletal hierarchy. It controls how the nodes of the hierarchy are transformed over time.',
        url: 'http://developer.playcanvas.com/api/pc.Animation.html'
    }, {
        title: 'duration',
        description: 'Duration of the animation in seconds.',
        url: 'http://developer.playcanvas.com/api/pc.Animation.html'
    }];

    // fields reference
    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:animation:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-css-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'asset',
        title: 'CSS',
        subTitle: '{String}',
        description: 'CSS string to be used in application.'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:css:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-cubemap-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'asset',
        title: 'pc.Texture',
        subTitle: '{Class}',
        description: 'Cube maps are a special type of texture asset. They are formed from 6 texture assets where each texture represents the face of a cube. They typically have two uses: A cube map can define your scene\'s sky box. A sky box contains imagery of the distant visuals of your scene such as hills, mountains, the sky and so on. A cube map can add reflections to any material. Imagine a shiny, chrome ball bearing in your scene. The ball reflects the surrounding scene. For open environments, you would normally set the scene\'s sky box cube map as the cube map on a reflective object\'s materials.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html'
    }, {
        title: 'anisotropy',
        subTitle: '{Number}',
        description: 'Integer value specifying the level of anisotropic to apply to the texture ranging from 1 (no anisotropic filtering) to the pc.GraphicsDevice property maxAnisotropy.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#anisotropy'
    }, {
        title: 'magFilter',
        subTitle: '{pc.FILTER_*}',
        description: 'The magnification filter to be applied to the texture.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#magFilter'
    }, {
        title: 'mipFilter',
        subTitle: '{pc.FILTER_*}',
        description: 'The minification mipmap filter to be applied to the texture.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#mipFilter'
    }, {
        title: 'minFilter',
        subTitle: '{pc.FILTER_*}',
        description: 'The minification filter to be applied to the texture.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#minFilter'
    }, {
        name: 'slots',
        title: 'Texture Slots',
        description: 'The six texture assets that correspond to the faces of a cube. Helping you to connect faces together correctly. Think of the preview as a box unfolded to a flat plane.'
    }, {
        name: 'prefilter',
        title: 'Prefiltering',
        description: 'Prefilter button generates a set of low-resolution filtered textures which are used in the environment map of the Physical material. Prefiltering the cube map is essential for using the Physical material.'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:cubemap:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-html-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'asset',
        title: 'HTML',
        subTitle: '{String}',
        description: 'HTML string to be used in application.'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:html:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-json-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'asset',
        title: 'JSON',
        subTitle: '{Object}',
        description: 'JSON data to be used in application.'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:json:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-material-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'asset',
        title: 'pc.Material',
        subTitle: '{Class}',
        description: 'Every surface on a 3D model is rendered using a material. The material defines the properties of that surface, such as its color, shininess, bumpiness. In PlayCanvas, a material is an Asset type which collects all these properties together. By default, it represents a Physical material. This exposes the fundamental properties that can be used to create many different types for visual effects, from smooth plastic, to rough wood, or scratched metal.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        name: 'ambientOverview',
        description: 'Ambient properties determine how the material appears in ambient light.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        title: 'ambient',
        subTitle: '{pc.Color}',
        description: 'The tint color to multiply the scene\'s global ambient color.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#ambient'
    }, {
        title: 'ambientTint',
        subTitle: '{Boolean}',
        description: 'Check this to multiply the scene\'s global ambient color with a material specific color.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#ambientTint'
    }, {
        title: 'aoMap',
        subTitle: '{pc.Texture}',
        description: 'An ambient occlusion map containing pre-baked ambient occlusion.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#aoMap'
    }, {
        title: 'aoMapChannel',
        subTitle: '{String}',
        description: 'An ambient occlusion map color channel to extract color value from texture. Can be: r, g, b, a',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#aoMapChannel'
    }, {
        title: 'aoMapUv',
        subTitle: '{Number}',
        description: 'AO map UV channel',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#aoMapUv'
    }, {
        title: 'aoMapVertexColor',
        subTitle: '{Boolean}',
        description: 'Use vertex colors for AO instead of a map',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#aoMapVertexColor'
    }, {
        title: 'aoMapTiling',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D tiling of the AO map.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#aoMapTiling'
    }, {
        title: 'aoMapOffset',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D offset of the AO map. Each component is between 0 and 1.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#aoMapOffset'
    }, {
        title: 'blendType',
        subTitle: '{pc.BLEND_*}',
        description: 'The type of blending for this material. Options are:\n \
        <b>None {pc.BLEND_NONE}</b>: The mesh is opaque. This is the default.\n \
        <b>Normal {pc.BLEND_NORMAL}</b>: The mesh is transparent, like stained glass. Called as Alpha Blend as well.\n \
        <b>Additive {pc.BLEND_ADDITIVE}</b>: The mesh color is added to whatever has already been rendered to the frame buffer.\n \
        <b>Additive Alpha {pc.BLEND_ADDITIVEALPHA}</b>: Same as Additive except source RGB is multiplied by the source alpha.\n \
        <b>Screen {pc.BLEND_SCREEN}</b>: Softer version of Additive.\n \
        <b>Pre-multiply {pc.BLEND_PREMULTIPLIED}</b>: Like \'Normal\' blending except it is assumed that the color of the mesh being rendered with this material has already been modulated by its alpha value.\n \
        <b>Multiply {pc.BLEND_MULTIPLICATIVE}</b>: When rendered, the mesh color is multiplied by whatever has already been rendered to the frame buffer.\n \
        <b>Modulate 2x {pc.BLEND_MULTIPLICATIVE2X}</b>: Multiplies colors and doubles the result.\n \
        <b>Min {pc.BLEND_MIN}</b>: [Partial Support, check `app.graphicsDevice.extBlendMinmax` for support] Minimum color.\n \
        <b>Max {pc.BLEND_MAX}</b>: [Partial Support, check `app.graphicsDevice.extBlendMinmax` for support] Maximum color.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#blendType'
    }, {
        title: 'bumpiness',
        subTitle: '{Number}',
        description: 'The strength of the applied normal map. This is a value between 0 (the normal map has no effect) and 2 (the effect of the normal map is exagerrated). It defaults to 1.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#bumpiness'
    }, {
        title: 'conserveEnergy',
        subTitle: '{Boolean}',
        description: 'Defines how diffuse and specular components are combined when Fresnel is on. It is recommended that you leave this option enabled, although you may want to disable it in case when all reflection comes only from a few light sources, and you don\'t use an environment map, therefore having mostly black reflection.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#conserveEnergy'
    }, {
        title: 'cubeMap',
        subTitle: '{pc.Texture}',
        description: 'A cube map texture asset that approximates environment reflection (with greater accuracy than is possible with a sphere map). If scene has SkyBox set, then it will be used as default cubeMap',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#cubeMap'
    }, {
        title: 'cubeMapProjection',
        subTitle: '{pc.CUBEPROJ_*}',
        description: 'The type of projection applied to the cubeMap property, with available options: pc.CUBEPROJ_NONE and pc.CUBEPROJ_BOX. Set to Box to enable world-space axis-aligned projection of cubemap based on bounding box.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#cubeMapProjection'
    }, {
        name: 'cubeMapProjectionBoxCenter',
        title: 'cubeMapProjectionBox',
        subTitle: '{pc.BoundingBox}',
        description: 'The world space axis-aligned bounding box defining the box-projection used for the cubeMap property. Only used when cubeMapProjection is set to pc.CUBEPROJ_BOX.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#cubeMapProjectionBox'
    }, {
        name: 'cubeMapProjectionBoxHalfExtents',
        title: 'cubeMapProjectionBox',
        subTitle: '{pc.BoundingBox}',
        description: 'The world space axis-aligned bounding box defining the box-projection used for the cubeMap property. Only used when cubeMapProjection is set to pc.CUBEPROJ_BOX.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#cubeMapProjectionBox'
    }, {
        title: 'cull',
        subTitle: '{pc.CULLFACE_*}',
        description: 'Options are: None {pc.CULLFACE_NONE}: Both front faces and back faces are rendered. Front Faces {pc.CULLFACE_FRONT}: front faces are rendered and back faces are not. Back Faces {pc.CULLFACE_BACK}: back faces are rendered and front faces are not. This is the default. PlayCanvas dictates that a counter-clockwise vertex winding specifies a front face triangle. Note that backface culling is often good for performance because backface pixels are often overwritten (for convex meshes) which can result in redundant filling of pixels.'
    }, {
        title: 'depthTest',
        subTitle: '{Boolean}',
        description: 'If checked, when a mesh with the material is rendered, a per pixel check is performed to determine if the pixel passes the engine\'s depth test. By default, the test is that the pixel must have a z depth less than or equal to whatever is already in the depth buffer. In other words, the mesh is only visible if nothing is in front of it. If unchecked, the mesh is rendered regardless of what is already in the depth buffer. Defaults to on.'
    }, {
        title: 'depthWrite',
        subTitle: '{Boolean}',
        description: 'If checked, when a mesh with the material is rendered, its depth information is written to the depth buffer. This ensures that when subsequent meshes are rendered, they can be successfully depth tested against meshes rendered with this material. Defaults to on.'
    }, {
        name: 'diffuseOverview',
        description: 'Diffuse properties define the how a material reflects diffuse light emitted by dynamic light sources in the scene.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        title: 'diffuse',
        subTitle: '{pc.Color}',
        description: 'If no diffuse map is set or tint is enabled, this is the diffuse color of the material.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#diffuse'
    }, {
        title: 'diffuseMap',
        subTitle: '{pc.Texture}',
        description: 'The diffuse map that specifies the per-pixel diffuse material color. If no diffuse map is set, the diffuse color is used instead.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#diffuseMap'
    }, {
        title: 'diffuseMapChannel',
        subTitle: '{String}',
        description: 'An diffuse map color channel to extract color value from texture. Can be: r, g, b, a, rgb',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#diffuseMapChannel'
    }, {
        title: 'diffuseMapOffset',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D offset of the diffuseMap. Each component is between 0 and 1.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#diffuseMapOffset'
    }, {
        title: 'diffuseMapTiling',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D tiling of the diffuseMap.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#diffuseMapTiling'
    }, {
        title: 'diffuseMapTint',
        subTitle: '{Boolean}',
        description: 'Check this to modulate the material\'s diffuse map with a material specific diffuse color.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#diffuseMapTint'
    }, {
        title: 'diffuseMapUv',
        subTitle: '{Number}',
        description: 'Diffuse map UV channel',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#diffuseMapUv'
    }, {
        title: 'diffuseMapVertexColor',
        subTitle: '{Boolean}',
        description: 'Use vertex colors for diffuse instead of a map',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#diffuseMapVertexColor'
    }, {
        name: 'emissiveOverview',
        description: 'Emissive properties control how the material emits light (as opposed to reflecting light).',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        title: 'emissive',
        subTitle: '{pc.Color}',
        description: 'If no emissive map is set or tint is enabled, this is the emissive color of the material.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#emissive'
    }, {
        title: 'emissiveIntensity',
        subTitle: '{Number}',
        description: 'A multiplier for emissive color that can achieve overbright effects for exceptionally bright emissive materials.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#emissiveIntensity'
    }, {
        title: 'emissiveMap',
        subTitle: '{pc.Texture}',
        description: 'The emissive map that specifies the per-pixel emissive color. If no emissive map is set, the emissive color is used instead.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#emissiveMap'
    }, {
        title: 'emissiveMapChannel',
        subTitle: '{String}',
        description: 'An emissive map color channel to extract color value from texture. Can be: r, g, b, a, rgb',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#emissiveMapChannel'
    }, {
        title: 'emissiveMapOffset',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D offset of the emissiveMap. Each component is between 0 and 1.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#emissiveMapOffset'
    }, {
        title: 'emissiveMapTiling',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D tiling of the emissiveMap.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#emissiveMapTiling'
    }, {
        title: 'emissiveMapTint',
        subTitle: '{Boolean}',
        description: 'Check this to modulate the material\'s emissive map with a material specific emissive color.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#emissiveMapTint'
    }, {
        title: 'emissiveMapUv',
        subTitle: '{Number}',
        description: 'Emissive map UV channel',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#emissiveMapUv'
    }, {
        title: 'emissiveMapVertexColor',
        subTitle: '{Boolean}',
        description: 'Use vertex colors for emission instead of a map',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#emissiveMapVertexColor'
    }, {
        name: 'environmentOverview',
        description: 'Environment properties determine how a material reflects and refracts the environment.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        title: 'fresnelModel',
        subTitle: '{pc.FRESNEL_*}',
        description: 'A parameter for Fresnel. May mean different things depending on fresnelModel.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#fresnelModel'
    }, {
        title: 'glossMap',
        subTitle: '{pc.Texture}',
        description: 'The gloss map that specifies a per-pixel shininess value. The gloss map is modulated by the shininess property.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#glossMap'
    }, {
        title: 'glossMapChannel',
        subTitle: '{String}',
        description: 'An gloss map color channel to extract color value from texture. Can be: r, g, b, a',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#glossMapChannel'
    }, {
        title: 'glossMapOffset',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D offset of the glossMap. Each component is between 0 and 1.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#glossMapOffset'
    }, {
        title: 'glossMapTiling',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D tiling of the glossMap.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#glossMapTiling'
    }, {
        title: 'glossMapUv',
        subTitle: '{Number}',
        description: 'Gloss map UV channel',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#glossMapUv'
    }, {
        title: 'glossMapVertexColor',
        subTitle: '{Boolean}',
        description: 'Use vertex colors for glossiness instead of a map',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#glossMapVertexColor'
    }, {
        title: 'heightMap',
        subTitle: '{pc.Texture}',
        description: 'The height map that specifies the per-pixel strength of the parallax effect. White is full height and black is zero height.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#heightMap'
    }, {
        title: 'heightMapChannel',
        subTitle: '{String}',
        description: 'An height map color channel to extract color value from texture. Can be: r, g, b, a',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#heightMapChannel'
    }, {
        title: 'heightMapFactor',
        subTitle: '{Number}',
        description: 'The strength of a parallax effect (a value between 0 and 2, defaulting to 1).',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#heightMapFactor'
    }, {
        title: 'heightMapOffset',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D offset of the heightMap. Each component is between 0 and 1.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#heightMapOffset'
    }, {
        title: 'heightMapTiling',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D tiling of the heightMap.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#heightMapTiling'
    }, {
        title: 'heightMapUv',
        subTitle: '{Number}',
        description: 'Height map UV channel',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#heightMapUv'
    }, {
        name: 'lightMapOverview',
        description: 'Light maps contain pre-baked diffuse lighting. Using light maps is considered an optimization in that runtime dynamic lighting calculations can be pre-calculated.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        title: 'lightMap',
        subTitle: '{pc.Texture}',
        description: 'The lightmap texture that contains pre-baked diffuse lighting. The lightmap usually is applied to the second UV set.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#lightMap'
    }, {
        title: 'lightMapChannel',
        subTitle: '{String}',
        description: 'An light map color channel to extract color value from texture. Can be: r, g, b, a, rgb',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#lightMapChannel'
    }, {
        title: 'lightMapUv',
        subTitle: '{Number}',
        description: 'Lightmap UV channel',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#lightMapUv'
    }, {
        title: 'lightMapVertexColor',
        subTitle: '{Boolean}',
        description: 'Use vertex lightmap instead of a texture-based one',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#lightMapVertexColor'
    }, {
        title: 'lightMapTiling',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D tiling of the lightmap.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#lightMapTiling'
    }, {
        title: 'lightMapOffset',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D offset of the lightmap. Each component is between 0 and 1.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#lightMapOffset'
    }, {
        title: 'metalness',
        subTitle: '{Number}',
        description: 'Metalness factor multiplier.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#metalness'
    }, {
        title: 'metalnessMap',
        subTitle: '{pc.Texture}',
        description: 'This map specifies per-pixel metalness values. A value of 1 is metal and a value of 0 is non-metal.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#metalnessMap'
    }, {
        title: 'metalnessMapChannel',
        subTitle: '{String}',
        description: 'An metalness map color channel to extract color value from texture. Can be: r, g, b, a',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#metalnessMapChannel'
    }, {
        title: 'metalnessMapUv',
        subTitle: '{Number}',
        description: 'Metnalness map UV channel',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#metalnessMapUv'
    }, {
        title: 'metalnessMapVertexColor',
        subTitle: '{Boolean}',
        description: 'Use vertex colors for metalness instead of a map',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#metalnessMapVertexColor'
    }, {
        title: 'metalnessMapTiling',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D tiling of the metalness map.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#metalnessMapTiling'
    }, {
        title: 'metalnessMapOffset',
        subTitle: '{String}',
        description: 'Controls the 2D offset of the metalness map. Each component is between 0 and 1.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#metalnessMapChannel'
    }, {
        name: 'normalOverview',
        description: 'Use this to specify normal maps in order to simulate \'Bumpiness\' effect.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        title: 'normalMap',
        subTitle: '{pc.Texture}',
        description: 'The normal map that specifies the per-pixel surface normals. The normal map is modulated by the \'Bumpiness\' property.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#normalMap'
    }, {
        title: 'normalMapOffset',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D offset of the normalMap. Each component is between 0 and 1.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#normalMapOffset'
    }, {
        title: 'normalMapTiling',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D tiling of the normalMap.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#normalMapTiling'
    }, {
        title: 'normalMapUv',
        subTitle: '{Number}',
        description: 'Normal map UV channel',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#normalMapUv'
    }, {
        title: 'occludeSpecular',
        subTitle: '{Boolean}',
        description: 'If checked, ambient color will occlude specular factor of a material.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#occludeSpecular'
    }, {
        name: 'other',
        description: 'Other Render States gives additional controls over how a mesh is rendered with the specified material.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        name: 'offset',
        description: 'The offset in U and V to apply to the first UV channel referenced by maps in this material.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        name: 'offsetTiling',
        description: 'The offset and tiling in U and V to apply to the UV channel referenced by all maps in this material.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        name: 'opacityOverview',
        description: 'Opacity sets the transparency level.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        title: 'opacity',
        subTitle: '{Number}',
        description: 'The opacity of the material. This is a value between 0 (completely transparent) and 1 (complately opaque. It defaults to 1.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#opacity'
    }, {
        title: 'opacityMap',
        subTitle: '{pc.Texture}',
        description: 'The opacity map that specifies the per-pixel opacity. The opacity map is modulated by the \'Amount\' property.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#opacityMap'
    }, {
        title: 'opacityMapChannel',
        subTitle: '{String}',
        description: 'An opacity map color channel to extract color value from texture. Can be: r, g, b, a',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#opacityMapChannel'
    }, {
        title: 'opacityMapOffset',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D offset of the opacityMap. Each component is between 0 and 1.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#opacityMapOffset'
    }, {
        title: 'opacityMapTiling',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D tiling of the opacityMap.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#opacityMapTiling'
    }, {
        title: 'opacityMapUv',
        subTitle: '{Number}',
        description: 'Opacity map UV channel',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#opacityMapUv'
    }, {
        title: 'opacityMapVertexColor',
        subTitle: '{Boolean}',
        description: 'Use vertex colors for opacity instead of a map',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#opacityMapVertexColor'
    }, {
        name: 'parallaxOverview',
        description: 'A height map gives further realism to a normal map by giving the illusion of depth to a surface. Note that parallax options are only enabled if you have set a normal map on the material.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        title: 'reflectivity',
        subTitle: '{Number}',
        description: 'A factor to determin what portion of light is reflected from the material. This value defaults to 1 (full reflectivity).',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#reflectivity'
    }, {
        title: 'refraction',
        subTitle: '{Number}',
        description: 'A factor to determine what portion of light passes through the material.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#refraction'
    }, {
        title: 'refractionIndex',
        subTitle: '{Number}',
        description: 'Determines the amount of distortion of light passing through the material.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#refractionIndex'
    }, {
        title: 'shadingModel',
        subTitle: '{pc.SPECULAR_*}',
        description: 'Defines the shading model. Phong {pc.SPECULAR_PHONG}: Phong without energy conservation. You should only use it as a backwards compatibility with older projects. Physical {pc.SPECULAR_BLINN}: Energy-conserving Blinn-Phong.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#shadingModel'
    }, {
        title: 'shininess',
        subTitle: '{Number}',
        description: 'A value determining the smoothness of a surface. For smaller shininess values, a surface is rougher and specular highlights will be broader. For larger shininess values, a surface is smoother and will exhibit more concentrated specular highlights (as is the surace is polished and shiny).',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#shininess'
    }, {
        name: 'specularOverview',
        description: 'Specular properties defines the color of the specular highlights. i.e. the shininess',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        title: 'specular',
        subTitle: '{pc.Color}',
        description: 'If no specular map is set or tint is checked, this is the specular color of the material.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#specular'
    }, {
        title: 'specularAntialias',
        subTitle: '{Boolean}',
        description: 'Enables Toksvig AA for mipmapped normal maps with specular.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#specularAntialias'
    }, {
        title: 'specularMap',
        subTitle: '{pc.Texture}',
        description: 'The specular map that specifies the per-pixel specular color. If no specular map is set, the specular color is used instead.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#specularMap'
    }, {
        title: 'specularMapChannel',
        subTitle: '{String}',
        description: 'An specular map color channel to extract color value from texture. Can be: r, g, b, a, rgb',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#specularMapChannel'
    }, {
        title: 'specularMapOffset',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D offset of the specularMap. Each component is between 0 and 1.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#specularMapOffset'
    }, {
        title: 'specularMapTiling',
        subTitle: '{pc.Vec2}',
        description: 'Controls the 2D tiling of the specularMap.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#specularMapTiling'
    }, {
        title: 'specularMapTint',
        subTitle: '{Boolean}',
        description: 'Check this to modulate the material\'s specular map with a material specific specular color.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#specularMapTint'
    }, {
        title: 'specularMapUv',
        subTitle: '{Number}',
        description: 'Specular map UV channel.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#specularMapUv'
    }, {
        title: 'specularMapVertexColor',
        subTitle: '{Boolean}',
        description: 'Use vertex colors for specular instead of a map.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#specularMapVertexColor'
    }, {
        title: 'sphereMap',
        subTitle: '{pc.Texture}',
        description: 'A sphere map texture asset that approximates environment reflection. If a sphere map is set, the Cube Map property will be hidden (since these properties are mutually exclusive).',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#sphereMap'
    }, {
        name: 'tiling',
        description: 'The scale in U and V to apply to the first UV channel referenced by maps in this material.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html'
    }, {
        title: 'useMetalness',
        subTitle: '{Boolean}',
        description: 'Toggle between specular and metalness workflow.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#useMetalness'
    }, {
        title: 'alphaTest',
        subTitle: '{Number}',
        description: 'The alpha test reference value to control which fragements are written to the currently active render target based on alpha value. All fragments with an alpha value of less than the alphaTest reference value will be discarded. alphaTest defaults to 0 (all fragments pass).',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#alphaTest'
    }, {
        title: 'alphaToCoverage',
        subTitle: '{Boolean}',
        webgl2: true,
        description: 'Enables or disables alpha to coverage. When enabled, and if hardware anti-aliasing is on, limited order-independent transparency can be achieved. Quality depends on the number of MSAA samples of the current render target. It can nicely soften edges of otherwise sharp alpha cutouts, but isn\'t recommended for large area semi-transparent surfaces. Note, that you don\'t need to enable blending to make alpha to coverage work. It will work without it, just like alphaTest.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#alphaToCoverage'
    }, {
        title: 'useFog',
        subTitle: '{Boolean}',
        description: 'Apply fogging (as configured in scene settings).',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#useFog'
    }, {
        title: 'useLighting',
        subTitle: '{Boolean}',
        description: 'Apply lighting.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#useLighting'
    }, {
        title: 'useSkybox',
        subTitle: '{Boolean}',
        description: 'Apply scene skybox as prefiltered environment map.',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#useSkybox'
    }, {
        title: 'useGammaTonemap',
        subTitle: '{Boolean}',
        description: 'Apply gamma correction and tonemapping (as configured in scene settings).',
        url: 'http://developer.playcanvas.com/api/pc.StandardMaterial.html#useGammaTonemap'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:material:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-model-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        title: 'meshInstances',
        subTitle: '{pc.MeshInstance[]}',
        description: 'An array of meshInstances contained in this model. Materials are defined for each individual Mesh Instance.',
        url: 'http://developer.playcanvas.com/api/pc.Model.html#meshInstances'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:model:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-script-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        title: 'filename',
        subTitle: '{String}',
        description: 'Filename of a script..'
    }, {
        name: 'order',
        description: 'Sometimes specific order of loading and executing JS files is required. All preloaded script assets will be loaded in order specified in Project Settings. You can further control when you want a Script Asset to load by changing the Loading Type.'
    }, {
        name: 'loadingType',
        description: 'This allows you to control when this script will be loaded. The possible values are "Asset" (load as a regular Asset), "Before Engine" (load before the PlayCanvas engine is loaded), "After Engine" (load right after the PlayCanvas engine has loaded)'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:script:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-text-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'asset',
        title: 'TEXT',
        subTitle: '{String}',
        description: 'String data to be used in application.'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:text:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-texture-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'asset',
        title: 'pc.Texture',
        subTitle: '{Class}',
        description: 'Textures assets are image files which are used as part of a material to give a 3D model a realistic appearance.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html'
    }, {
        name: 'dimensions',
        title: 'width / height',
        subTitle: '{Number}',
        description: 'The width and height of the texture.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#width'
    }, {
        title: 'magFilter',
        subTitle: '{pc.FILTER_*}',
        description: 'The magnification filter to be applied to the texture.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#magFilter'
    }, {
        title: 'mipFilter',
        subTitle: '{pc.FILTER_*}',
        description: 'The minification mipmap filter to be applied to the texture.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#mipFilter'
    }, {
        title: 'minFilter',
        subTitle: '{pc.FILTER_*}',
        description: 'The minification filter to be applied to the texture.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#minFilter'
    }, {
        title: 'addressU',
        subTitle: '{pc.ADDRESS_*}',
        description: 'The addressing mode to be applied to the texture.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#addressU'
    }, {
        title: 'addressV',
        subTitle: '{pc.ADDRESS_*}',
        description: 'The addressing mode to be applied to the texture.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#addressV'
    }, {
        title: 'anisotropy',
        subTitle: '{Number}',
        description: 'Integer value specifying the level of anisotropic to apply to the texture ranging from 1 (no anisotropic filtering) to the pc.GraphicsDevice property maxAnisotropy.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#anisotropy'
    }, {
        title: 'width',
        subTitle: '{Number}',
        description: 'The width of the base mip level in pixels.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#width'
    }, {
        title: 'height',
        subTitle: '{Number}',
        description: 'The height of the base mip level in pixels.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#height'
    }, {
        title: 'depth',
        description: 'Bits per pixel.'
    }, {
        title: 'alpha',
        description: 'If picture has alpha data.'
    }, {
        title: 'interlaced',
        description: 'If picture is Interlaced. This picture (PNG, JPG) format feature is unavailable for WebGL but is available for use in DOM, making pictures to appear before fully loaded, and load progresively.'
    }, {
        title: 'rgbm',
        subTitle: '{Boolean}',
        description: 'Specifies whether the texture contains RGBM-encoded HDR data. Defaults to false.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#rgbm'
    }, {
        title: 'filtering',
        subTitle: '{pc.FILTER_*}',
        description: 'This property is exposed as minFilter and magFilter to specify how texture is filtered.',
        url: 'http://developer.playcanvas.com/api/pc.Texture.html#magFilter'
    }, {
        name: 'compression',
        title: 'Compression',
        description: 'Compressed textures load faster and consume much less VRAM on GPU allowing texture intense applications to have bigger scale.'
    }, {
        name: 'compress:alpha',
        title: 'Compress Alpha',
        description: 'If compressed texture should have alpha.'
    }, {
        name: 'compress:normals',
        title: 'Compress Normals',
        description: 'If the compressed texture should treat pixels as normal data.'
    }, {
        name: 'compress:original',
        title: 'Original Format',
        description: 'Original file format.'
    }, {
        name: 'compress:dxt',
        title: 'DXT (S3 Texture Compression)',
        description: 'S3TC is widely available on Desktop machines. It is very GZIP friendly, download sizes shown are gzip\'ed. It offers two formats available to WebGL: DXT1 and DXT5. Second has extra alpha available and is twice bigger than DXT1. Texture must be power of two resolution. Compression is Lossy and does leak RGB channel values.'
    }, {
        name: 'compress:pvr',
        title: 'PVTC (PowerVR Texture Compression)',
        description: 'Widely available on iOS devices. It is very GZIP friendly, download sizes shown are gzip\'ed. Version 1 of compresison offers four formats to WebGL, differs in BPP and extra Alpha channel. Texture resolution must be square and power of two otherwise will be upscaled to nearest pot square. This format allows to store alpha. Compression is Lossy and does leak RGB channel values, as well as Alpha channel but much less than RGB.'
    }, {
        name: 'compress:pvrBpp',
        title: 'PVR Bits Per Pixel',
        description: 'Bits Per Pixel to store. With options to store 2 or 4 bits per pixel. 2bpp is twice smaller with worse quality.'
    }, {
        name: 'compress:etc',
        title: 'ETC (Ericsson Texture Compression)',
        description: 'This format covers well some Android devices as well as Destop. It is very GZIP friendly, download sizes shown are gzip\'ed. WebGL exposes support for ETC1 only whcih only stores RGB so this format is not available for storing Alpha channel. It is Lossy and suffers from RGB channel leaking.'
    }, {
        name: 'compress:quality',
        title: 'Compression quality',
        description: 'Set the compression quality for the texture.'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:texture:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-shader-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'asset',
        title: 'Shader',
        subTitle: '{String}',
        description: 'Text containing GLSL to be used in the application.'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:shader:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-font-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'asset',
        title: 'FONT',
        subTitle: '{Font}',
        description: 'A Font that can be used to render text using the Text Component.'
    }, {
        name: 'intensity',
        title: 'intensity',
        description: 'Intensity is used to boost the value read from the signed distance field, 0 is no boost, 1 is max boost. This can be useful if the font does not render with clean smooth edges with the default intensity or if you are rendering the font at small font sizes.'
    }, {
        name: 'customRange',
        title: 'CUSTOM CHARACTER RANGE',
        description: 'Add a custom range of characters by entering their Unicode codes in the From and To fields. E.g. to add all basic Latin characters you could enter 0x20 - 0x7e and click the + button.'
    }, {
        name: 'presets',
        title: 'CHARACTER PRESETS',
        description: 'Click on a character preset to add it to the selected font'
    }, {
        name: 'characters',
        title: 'CHARACTERS',
        description: 'All the characters that should be included in the runtime font asset. Note that in order for a character to be included in the runtime font, it must be supported by the source font. Click Process Font after you make changes to the characters.'
    }, {
        name: 'invert',
        title: 'INVERT',
        description: 'Enable this to invert the generated font texture. Click Process Font after changing this option.'
    }, {
        name: 'pxrange',
        title: 'MULTI-CHANNEL SIGNED DISTANCE PIXEL RANGE',
        description: 'Specifies the width of the range around each font glyph between the minimum and maximum representable signed distance, in pixels. Click Process Font after changing this option.'
    }];

    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:font:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});


/* editor/attributes/reference/attributes-asset-sprite-reference.js */
editor.once('load', function() {
    'use strict';

    var fields = [{
        name: 'sprite',
        title: 'pc.Sprite',
        subTitle: '{Class}',
        description: 'A Sprite Asset can contain one or multiple Frames from a Texture Atlas Asset. It can be used by the Sprite Component or the Element component to render those frames. You can also implement sprite animations by adding multiple Frames to a Sprite Asset.',
        url: 'http://developer.playcanvas.com/api/pc.Sprite.html'
    }, {
        title: 'pixelsPerUnit',
        subTitle: '{Number}',
        description: 'The number of pixels that represent one PlayCanvas unit. You can use this value to change the rendered size of your sprites.',
        url: 'http://developer.playcanvas.com/api/pc.Sprite.html#pixelsPerUnit'
    }, {
        title: 'renderMode',
        subTitle: '{Number}',
        description: 'The render mode of the Sprite Asset. It can be Simple, Sliced or Tiled.',
        url: 'http://developer.playcanvas.com/api/pc.Sprite.html#renderMode'
    }, {
        title: 'textureAtlasAsset',
        subTitle: '{Number}',
        description: 'The Texture Atlas asset that contains all the frames that this Sprite Asset is referencing.',
        url: 'http://developer.playcanvas.com/api/pc.Sprite.html#textureAtlasAsset'
    }];

    // fields reference
    for(var i = 0; i < fields.length; i++) {
        fields[i].name = 'asset:sprite:' + (fields[i].name || fields[i].title);
        editor.call('attributes:reference:add', fields[i]);
    }
});