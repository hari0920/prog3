
//Hariharan Ramshankar 
//Student ID:200133234
// Very Useful Resources 
// http://learningwebgl.com/blog/ 
//http://www.shaderific.com/glsl-functions/
// https://webglfundamentals.org/

/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog2/triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog2/ellipsoids.json"; // ellipsoids file loc
var Eye = new vec4.fromValues(0.5, 0.5, -0.5, 1.0); // default eye position in world space
var LightPos = new vec3.fromValues(-1, 3, -0.5); //position of light
var LightCol = [1, 1, 1]; // intensity of light
var viewUp = [0, 1, 0]; //up vector
var lookat = [0, 0, 1]; // look at vector
var ambient = [];
var diffuse = [];
var specular = [];
var specpower = [];
/* input globals */
var inputTriangles; // the triangles read in from json
var numTriangleSets = 0; // the number of sets of triangles
var triSetSizes = []; // the number of triangles in each set

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffers = []; // this contains vertex coordinates in triples, organized by tri set
var triangleBuffers = []; // this contains indices into vertexBuffers in triples, organized by tri set
var normalBuffers = [];
var vertexPositionAttrib; // where to put position for vertex shader
var vertexNormalAttrib; //where to put normal for vertex shader
var modelMatrixULoc; // where to put the model matrix for vertex shader
var pMatrixULoc;
var nMatrixULoc;
var EyePosULoc;
var LightColULoc;
var LightPosULoc;
var LightModelULoc;
var mMatrix = mat4.create(); //modelmatrix
var pMatrix = mat4.create(); //perspective matrix
var nMatrix = mat4.create(); //normal matrix
var DiffuseColorULoc; //where to put diffuse color for shader
var AmbientColorULoc; //where to put ambient color for shader
var SpecularColorULoc; //where to put specular color for shader
var SpecPowerULoc;
var triangle_rotation_x;
var triangle_translation_x;
var triangle_rotation_y;
var triangle_translation_y;
var triangle_rotation_z;
var triangle_translation_z;
var ellipsoid_rotation_x;
var ellipsoid_translation_x;
var ellipsoid_rotation_y;
var ellipsoid_translation_y;
var ellipsoid_rotation_z;
var ellipsoid_translation_z; 
var tx, ty, tz; //translate view
var rx, ry, rz; //rotate view
var model=0; //for selection
var triangle_set=0; //for model selection
var ellipsoid_set=0; //for model selection
var ambinc;
var difinc;
var specinc;
var specpowerinc;
var lightModel; //Blinn-Phong 1 for Phong alone
var highlight=1;
// ASSIGNMENT HELPER FUNCTIONS
//key functions
function KeyDown(event) 
{
    currentlyPressedKeys[event.keyCode] = true;
}
function KeyUp(event) 
{
    currentlyPressedKeys[event.keyCode] = false;
}

function updateevent() 
{
    if (currentlyPressedKeys[16]) 
    {
        if (currentlyPressedKeys[87]) 
        {
            rx += 1;
        }

        if (currentlyPressedKeys[83]) 
        {
            rx -= 1;
        }

        if (currentlyPressedKeys[65]) 
        {
            ry += 1;
        }
        if (currentlyPressedKeys[68]) 
        {
            ry -= 1;
        }

    }
    else 
    {

        if (currentlyPressedKeys[65]) 
        {
            tx += 0.01;
        }

        if (currentlyPressedKeys[68]) 
        {
            tx -= 0.01;
        }

        if (currentlyPressedKeys[81]) 
        {
            ty += 0.01;
        }

        if (currentlyPressedKeys[69]) 
        {
            ty -= 0.01;
        }

        if (currentlyPressedKeys[87]) 
        {
            tz += 0.01;
        }

        if (currentlyPressedKeys[83]) 
        {
            tz -= 0.01;
        }
    }
    //for selecting the model interactively
    if (currentlyPressedKeys[37]) 
    {
        wait(100);
        highlight=1;
        ellipsoid_set = 3;
        model = 0;
        if (triangle_set >= 1) 
        {
            triangle_set = 0;
        }
        else 
        {
            triangle_set += 1;
        }
    }
    else if (currentlyPressedKeys[39]) 
    {
        wait(100);
        highlight = 1;
        ellipsoid_set = 3;
        model = 0;
        if (triangle_set == 0) 
        {
            triangle_set = 1;
        }
        else 
        {
            triangle_set -= 1;
        }
    } //to wrap around
    else if (currentlyPressedKeys[38]) 
    {
        wait(100);
        highlight = 1;
        triangle_set = 2;
        model = 1;
        if (ellipsoid_set >= 2) 
        {
            ellipsoid_set = 0;
        }
        else 
        {
            ellipsoid_set += 1;
        }
    } 
    else if (currentlyPressedKeys[40]) 
    {
        wait(100);
        highlight = 1;
        triangle_set = 4;
        model = 1;
        if (ellipsoid_set == 0) 
        {
            ellipsoid_set = 2;
        } else ellipsoid_set -= 1;
    }


    if (currentlyPressedKeys[16]) 
    {
        var rotate_model_amount=1;
        if (currentlyPressedKeys[80]) 
        {
            if (model == 0)
                triangle_rotation_z[triangle_set] -= rotate_model_amount;
            ellipsoid_rotation_z[ellipsoid_set] -= rotate_model_amount;
        }
        if (currentlyPressedKeys[76]) 
        {
            if (model == 0)
                triangle_rotation_x[triangle_set] -= rotate_model_amount;
            ellipsoid_rotation_x[ellipsoid_set] -= rotate_model_amount;
        }
        if (currentlyPressedKeys[186]) 
        {
            if (model == 0)
                triangle_rotation_y[triangle_set] -= rotate_model_amount;
            ellipsoid_rotation_y[ellipsoid_set] -= rotate_model_amount;
        }
            if (currentlyPressedKeys[73]) 
        {
            if (model == 0)
                triangle_rotation_z[triangle_set] += rotate_model_amount;
            ellipsoid_rotation_z[ellipsoid_set] += rotate_model_amount;
        }
        if (currentlyPressedKeys[79]) 
        {
            if (model == 0)
                triangle_rotation_x[triangle_set] += rotate_model_amount;
            ellipsoid_rotation_x[ellipsoid_set] += rotate_model_amount;
        }
        
        if (currentlyPressedKeys[75]) 
        {
            if (model == 0)
                triangle_rotation_y[triangle_set] += rotate_model_amount;
            ellipsoid_rotation_y[ellipsoid_set] += rotate_model_amount;
        }
    }
    else 
    {
        var shift_model_amount=0.01;
        if (currentlyPressedKeys[79]) 
        {
            if (model == 0)
                triangle_translation_z[triangle_set] -= shift_model_amount;
            ellipsoid_translation_z[ellipsoid_set] -= shift_model_amount;
        }
        if (currentlyPressedKeys[76]) 
        {
            if (model == 0)
                triangle_translation_z[triangle_set] += shift_model_amount;
            ellipsoid_translation_z[ellipsoid_set] += shift_model_amount;
        }
        if (currentlyPressedKeys[75]) 
        {
            if (model == 0)
                triangle_translation_x[triangle_set] -= shift_model_amount;
            ellipsoid_translation_x[ellipsoid_set] -= shift_model_amount;
        }
        if (currentlyPressedKeys[186]) 
        {
            if (model == 0)
                triangle_translation_x[triangle_set] += shift_model_amount;
            ellipsoid_translation_x[ellipsoid_set] += shift_model_amount;
        }
        if (currentlyPressedKeys[73]) 
        {
            if (model == 0)
                triangle_translation_y[triangle_set] -= shift_model_amount;
            ellipsoid_translation_y[ellipsoid_set] -= shift_model_amount;
        }
        if (currentlyPressedKeys[80]) 
        {
            if (model == 0)
                triangle_translation_y[triangle_set] += shift_model_amount;
            ellipsoid_translation_y[ellipsoid_set] += shift_model_amount;
        }
    }

    if (currentlyPressedKeys[49]) 
    {
        wait(100);
        if (ambinc >= 1.0) {
            ambinc = 0.0;
        }
        else ambinc += 0.1;
    }
    if (currentlyPressedKeys[50]) {
        wait(100);
        if (difinc >= 1.0) {
            difinc = 0.0;
        }
        else difinc += 0.1;
    }
    if (currentlyPressedKeys[51]) {
        wait(100);
        if (specinc >= 1.0) {
            specinc = 0.0;
        }
        else specinc += 0.1;
    }
    if (currentlyPressedKeys[78]) {
        wait(100);
        if (specpowerinc >= 20.0) {
            specpowerinc = 0.0;
        }
        else specpowerinc += 1.0;
    }
    if (currentlyPressedKeys[66]) {
        //console.log(lightModel);
        wait(100)
        if (lightModel == 0.0) {
            lightModel = 1.0;
        }
        else {
            lightModel = 0.0;
        }
    }
    if (currentlyPressedKeys[27]) 
    { //esc key
        initialize();
    }
    if (currentlyPressedKeys[32])
    {
        highlight=0;
    }

}
//end key functions
// get the JSON file from the passed URL
function getJSONFile(url, descr) {
    try {
        if ((typeof (url) !== "string") || (typeof (descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET", url, false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now() - startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open " + descr + " file!";
            else
                return JSON.parse(httpReq.response);
        } // end if good params
    } // end try

    catch (e) {
        console.log(e);
        return (String.null);
    }
} // end get input json file

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it

    try {
        if (gl == null) {
            throw "unable to create gl context -- is your browser gl ready?";
        } else {
            gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
            gl.clearDepth(1.0); // use max when we clear the depth buffer
            gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
            //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            //gl.enable(gl.BLEND);
        }
    } // end try

    catch (e) {
        console.log(e);
    } // end catch

} // end setupWebGL

function initialize() 
{
    tx=0.0; ty=0.0; tz = 0.0;
    rx=0.0; ry=0.0; rz=0.0;
    triangle_rotation_x = vec3.fromValues(0.0, 0.0, 0.0);
    triangle_rotation_y = vec3.fromValues(0.0, 0.0, 0.0);
    triangle_rotation_z = vec3.fromValues(0.0, 0.0, 0.0);
    triangle_translation_x = vec3.fromValues(0.0, 0.0, 0.0);
    triangle_translation_y = vec3.fromValues(0.0, 0.0, 0.0);
    triangle_translation_z = vec3.fromValues(0.0, 0.0, 0.0);
    ellipsoid_rotation_x = vec3.fromValues(0.0, 0.0, 0.0);
    ellipsoid_rotation_y = vec3.fromValues(0.0, 0.0, 0.0);
    ellipsoid_rotation_z = vec3.fromValues(0.0, 0.0, 0.0);
    ellipsoid_translation_x = vec3.fromValues(0.0, 0.0, 0.0);
    ellipsoid_translation_y = vec3.fromValues(0.0, 0.0, 0.0);
    ellipsoid_translation_z = vec3.fromValues(0.0, 0.0, 0.0);
    ambinc=1.0;
    difinc=1.0;
    specinc=1.0;
    specpowerinc=0.0;
    lightModel=0.0;
    highlight = 1;
}
function refresh() 
{
    requestAnimationFrame(refresh);
    updateevent();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    loadTriangles();
    loadSpheres();
}

function wait(duration)
{
    var start_Time = new Date().getTime(); //returns the time value in milliseconds
    var elapsed=0;
    var current;
    while(elapsed< 1000000)
    {
        current = new Date().getTime();
        if(current-start_Time>duration)
        break;
    }
}
var currentlyPressedKeys = {};
// read triangles in, load them into webgl buffers and render
function loadTriangles() {
    inputTriangles = getJSONFile(INPUT_TRIANGLES_URL, "triangles");

    if (inputTriangles != String.null) {
        var whichSetVert; // index of vertex in current triangle set
        var whichSetTri; // index of triangle in current triangle set
        var vtxToAdd; // vtx coords to add to the coord array
        var triToAdd; // tri indices to add to the index array

        // for each set of tris in the input file
        numTriangleSets = inputTriangles.length;
        for (var whichSet = 0; whichSet < numTriangleSets; whichSet++) {
            //center calc
            inputTriangles[whichSet].centerArrayX = []; // create a list of coords for this tri set
            inputTriangles[whichSet].centerArrayY = [];
            inputTriangles[whichSet].centerArrayZ = [];
            for (whichSetVert = 0; whichSetVert < inputTriangles[whichSet].vertices.length; whichSetVert++) 
            {
                inputTriangles[whichSet].centerArrayX.push(inputTriangles[whichSet].vertices[whichSetVert][0]);
                inputTriangles[whichSet].centerArrayY.push(inputTriangles[whichSet].vertices[whichSetVert][1]);
                inputTriangles[whichSet].centerArrayZ.push(inputTriangles[whichSet].vertices[whichSetVert][2]);
                //inputTriangles[whichSet].centerArray.push(vtxToAdd[0]);
            } // end for vertices in set
            var tri_center = [];
            tri_center.push((inputTriangles[whichSet].centerArrayX[0] + inputTriangles[whichSet].centerArrayX[1] + inputTriangles[whichSet].centerArrayX[2]) / 3.0);
            tri_center.push((inputTriangles[whichSet].centerArrayY[0] + inputTriangles[whichSet].centerArrayY[1] + inputTriangles[whichSet].centerArrayY[2]) / 3.0);
            tri_center.push((inputTriangles[whichSet].centerArrayZ[0] + inputTriangles[whichSet].centerArrayZ[1] + inputTriangles[whichSet].centerArrayZ[2]) / 3.0);
            // set up the vertex coord array
            inputTriangles[whichSet].coordArray = []; // create a list of coords for this tri set
            for (whichSetVert = 0; whichSetVert < inputTriangles[whichSet].vertices.length; whichSetVert++) 
            {
                vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
                inputTriangles[whichSet].coordArray.push(vtxToAdd[0]);//x
                inputTriangles[whichSet].coordArray.push(vtxToAdd[1]);//y
                inputTriangles[whichSet].coordArray.push(vtxToAdd[2]);//z
                
            } // end for vertices in set
            
            // send the vertex coords to webGL
            vertexBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer for current set
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputTriangles[whichSet].coordArray), gl.STATIC_DRAW); // coords to that buffer

            // set up the triangle index array, adjusting indices across sets
            inputTriangles[whichSet].indexArray = []; // create a list of tri indices for this tri set
            triSetSizes[whichSet] = inputTriangles[whichSet].triangles.length;
            for (whichSetTri = 0; whichSetTri < triSetSizes[whichSet]; whichSetTri++) {
                triToAdd = inputTriangles[whichSet].triangles[whichSetTri];
                inputTriangles[whichSet].indexArray.push(triToAdd[0], triToAdd[1], triToAdd[2]);
            } // end for triangles in set

            // send the triangle indices to webGL
            triangleBuffers[whichSet] = gl.createBuffer(); // init empty triangle index buffer for current tri set
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(inputTriangles[whichSet].indexArray), gl.STATIC_DRAW); // indices to that buffer

            //setup the normal array
            inputTriangles[whichSet].normalArray = []; // create a list of coords for this tri set
            for (whichSetNormal = 0; whichSetNormal < inputTriangles[whichSet].normals.length; whichSetNormal++) {
                normToAdd = inputTriangles[whichSet].normals[whichSetNormal];
                inputTriangles[whichSet].normalArray.push(normToAdd[0], normToAdd[1], normToAdd[2]);
            } // end for normals in set

            normalBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer for current set
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputTriangles[whichSet].normalArray), gl.STATIC_DRAW); // coords to that buffer

            //send color to webGL
            diffuse = inputTriangles[whichSet].material.diffuse;
            ambient = inputTriangles[whichSet].material.ambient;
            specular = inputTriangles[whichSet].material.specular;
            specpower = inputTriangles[whichSet].material.n;
            //console.log(diffuse);
            
            var Rotation = vec3.fromValues(triangle_rotation_x[whichSet], triangle_rotation_y[whichSet], triangle_rotation_z[whichSet]);
            var Translation = vec3.fromValues(triangle_translation_x[whichSet], triangle_translation_y[whichSet], triangle_translation_z[whichSet]);
            var Scaling =[1.0,1.0,1.0];
            //now modelling matrix and normal matrix, perspective already set
            if (whichSet == triangle_set) 
            {
                //if highlighted we need to scale by 1.2
                vec3.scale(diffuse, diffuse, difinc);
                vec3.scale(ambient, ambient, ambinc);
                vec3.scale(specular, specular, specinc);
                specpower = inputTriangles[whichSet].material.n + specpowerinc;
                if(highlight)
                {
                    Scaling = [1.2, 1.2, 1.2];
                }
                //gl.uniform3fv(DiffuseColorULoc, diffuse);
                //gl.uniform3fv(AmbientColorULoc, ambient);
                //gl.uniform3fv(SpecularColorULoc, specular);
               // gl.uniform1f(SpecPowerULoc, specpower);
            }
            gl.uniform3fv(DiffuseColorULoc, diffuse);
            gl.uniform3fv(AmbientColorULoc, ambient);
            gl.uniform3fv(SpecularColorULoc, specular);
            gl.uniform1f(SpecPowerULoc, specpower);

            ModelMatrix(tri_center,Rotation,Translation,Scaling);
            //mat3.normalFromMat4(nMatrix, mMatrix); //Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
            var temp = mat4.create();
            mat4.invert(temp, mMatrix);
            mat4.transpose(temp, temp);
            nMatrix = temp;
            var l=lightModel;
            perspectivematrix();
            //now render
            // pass modeling matrix for set to shader and perspective matrix
            gl.uniformMatrix4fv(modelMatrixULoc, false, mMatrix);
            gl.uniformMatrix4fv(pMatrixULoc, false, pMatrix);
            gl.uniformMatrix4fv(nMatrixULoc, false, nMatrix);
            gl.uniform1f(lightModelULoc, lightModel);
            // vertex buffer: activate and feed into vertex shader
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[whichSet]); // activate
            gl.vertexAttribPointer(vertexPositionAttrib, 3, gl.FLOAT, false, 0, 0); // feed

            // normal buffer: activate and feed into vertex shader
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[whichSet]); // activate
            gl.vertexAttribPointer(vertexNormalAttrib, 3, gl.FLOAT, false, 0, 0); // feed

            // triangle buffer: activate and render
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate
            gl.drawElements(gl.TRIANGLES, 3 * triSetSizes[whichSet], gl.UNSIGNED_SHORT, 0); // render


        } // end for each triangle set
    } // end if triangles found
} // end load triangles

function loadSpheres() {
    var inputSpheres = getJSONFile(INPUT_SPHERES_URL, "ellipsoids");
    // for each set of tris in the input file
    if (inputSpheres != String.null) {
        numSphereSets = inputSpheres.length;
        for (var whichSet = 0; whichSet < numSphereSets; whichSet++) {
            //latitude longitude parametrization from lesson 11 on http://learningwebgl.com/blog/?p=1253
            var ellipsoid_center = [inputSpheres[whichSet].x, inputSpheres[whichSet].y, inputSpheres[whichSet].z];
            var radius = [inputSpheres[whichSet].a, inputSpheres[whichSet].b, inputSpheres[whichSet].c];
            var latitudeBands = 50;
            var longitudeBands = 50;
            var vertexPositionData = [];
            var vertexNormalData = [];
            /*
            From Assignment 1-Raycaster
            //Normal Calculation using partial derivatives
                        var x_n=2*((A.y*A.y)*(A.z*A.z))*(R_i.x-C.x);
                        var y_n=2*((A.x*A.x)*(A.z*A.z))*(R_i.y-C.y);
                        var z_n=2*((A.x*A.x)*(A.y*A.y))*(R_i.z-C.z);
                        nVect= new Vector(x_n,y_n,z_n);
            */
            //x=rsin theta cos phi
            //y=rcos theta
            //z=rsin theta sin phi
            for (var lat = 0; lat <= latitudeBands; lat++) 
            {
                var theta = lat * Math.PI / latitudeBands;
                var sintheta = Math.sin(theta);
                var costheta = Math.cos(theta);
                for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                    var phi = longNumber * 2 * Math.PI / longitudeBands;
                    var sinphi = Math.sin(phi);
                    var cosphi = Math.cos(phi);
                    var x = sintheta * cosphi;
                    var y = costheta;
                    var z = sintheta * sinphi;
                    if(whichSet==ellipsoid_set)
                    {   var high=[1.0,1.0,1.0];
                        vertexPositionData.push((ellipsoid_center[0] + (x * radius[0]*high[0])));
                        vertexPositionData.push((ellipsoid_center[1] + (y * radius[1]*high[1])));
                        vertexPositionData.push((ellipsoid_center[2] + (z * radius[2]*high[2])));
                    }
                    else
                    {
                        vertexPositionData.push(ellipsoid_center[0] + (x * radius[0]));
                        vertexPositionData.push(ellipsoid_center[1] + (y * radius[1]));
                        vertexPositionData.push(ellipsoid_center[2] + (z * radius[2]));

                    }
                    
                    vertexNormalData.push((2 * (radius[1] * radius[1] * radius[2] * radius[2]) * ((x * radius[0]))));
                    vertexNormalData.push((2 * (radius[0] * radius[0] * radius[2] * radius[2]) * ((y * radius[1]))));
                    vertexNormalData.push((2 * (radius[0] * radius[0] * radius[1] * radius[1]) * ((z * radius[2]))));
                    //vertexNormalData.push(x/(radius[0]*radius[0]));
                    //vertexNormalData.push(y/(radius[1]*radius[1]));
                    //vertexNormalData.push(z/(radius[2]*radius[2]));
                    vec3.normalize(vertexNormalData, vertexNormalData);
                }
            }
            //stitching vertices together
            var indexData = [];
            for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
                for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
                    var first = (latNumber * (longitudeBands + 1)) + longNumber;
                    var second = first + longitudeBands + 1;
                    indexData.push(first);
                    indexData.push(second);
                    indexData.push(first + 1);

                    indexData.push(second);
                    indexData.push(second + 1);
                    indexData.push(first + 1);
                }
            } //   
            //now send to webGL
            //vertex info
            vertexBuffers[whichSet] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[whichSet]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);

            normalBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer for current set
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormalData), gl.STATIC_DRAW); // coords to that buffer

            //triangle info
            triangleBuffers[whichSet] = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);

            //send color to webGL
            diffuse = inputSpheres[whichSet].diffuse;
            ambient = inputSpheres[whichSet].ambient;
            specular = inputSpheres[whichSet].specular;
            specpower = inputSpheres[whichSet].n;
            //console.log(diffuse);
            
            //gl.uniform3fv(DiffuseColorULoc, diffuse);
            //gl.uniform3fv(AmbientColorULoc, ambient);
            //gl.uniform3fv(SpecularColorULoc, specular);
            //gl.uniform1f(SpecPowerULoc, specpower);
            //now modelling matrix
            var Rotation = [ellipsoid_rotation_x[whichSet], ellipsoid_rotation_y[whichSet], ellipsoid_rotation_z[whichSet]];
            var Translation = [ellipsoid_translation_x[whichSet], ellipsoid_translation_y[whichSet], ellipsoid_translation_z[whichSet]];
            var Scaling = [1.0, 1.0, 1.0];
            //now modelling matrix and normal matrix, perspective already set
            if (whichSet == ellipsoid_set) {
                //if highlighted we need to scale by 1.2
                vec3.scale(diffuse, diffuse, difinc);
                vec3.scale(ambient, ambient, ambinc);
                vec3.scale(specular, specular, specinc);
                specpower = inputSpheres[whichSet].n+specpowerinc;
                if (highlight) 
                {
                    Scaling = [1.2, 1.2, 1.2];
                }
                //Scaling = [1.2, 1.2, 1.2];
                
            }
            gl.uniform3fv(DiffuseColorULoc, diffuse);
            gl.uniform3fv(AmbientColorULoc, ambient);
            gl.uniform3fv(SpecularColorULoc, specular);
            gl.uniform1f(SpecPowerULoc, specpower);
            ModelMatrix(ellipsoid_center,Rotation,Translation,Scaling);
            //mat3.normalFromMat4(nMatrix, mMatrix); //Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
            var temp = mat4.create();
            mat4.invert(temp, mMatrix);
            mat4.transpose(temp, temp);
            nMatrix = temp;
            var l = lightModel;
            perspectivematrix();
            //now render
            // pass modeling matrix for set to shader
            gl.uniformMatrix4fv(modelMatrixULoc, false, mMatrix);
            gl.uniformMatrix4fv(pMatrixULoc, false, pMatrix);
            gl.uniformMatrix4fv(nMatrixULoc, false, nMatrix);
            gl.uniform1f(lightModelULoc, lightModel);
            // vertex buffer: activate and feed into vertex shader
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[whichSet]); // activate
            gl.vertexAttribPointer(vertexPositionAttrib, 3, gl.FLOAT, false, 0, 0); // feed

            //normals
            
            // normal buffer: activate and feed into vertex shader
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[whichSet]); // activate
            gl.vertexAttribPointer(vertexNormalAttrib, 3, gl.FLOAT, false, 0, 0); // feed

            // triangle buffer: activate and render
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate
            gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0); // render

        }//end for ellipsoid set
    }//end if ellipsoid found
}//end load ellipsoids
function d2R(d)
{
    var rad=d*Math.PI/180;
    return rad;

}
function perspectivematrix() 
{
    mat4.perspective(pMatrix, Math.PI / 2, 1, 0.001, 100); //FOV of 90 degrees
}
function ModelMatrix(center,Rotation,Translation,Scaling) 
{
    var eye = vec3.fromValues(Eye[0], Eye[1], Eye[2]); //eye position
    var up = vec3.fromValues(viewUp[0], viewUp[1], viewUp[2]); //up vector
    var lAt = vec3.fromValues(0.5, 0.5, 0); //center 
    var t=vec3.fromValues(Translation[0],Translation[1],Translation[2]);
    var r=vec3.fromValues(Rotation[0],Rotation[1],Rotation[2]);
    var s=vec3.fromValues(Scaling[0],Scaling[1],Scaling[2]);
    //Viewing 
    //using mat4.lookat 
    var lookAt=mat4.create();
    var eye_new=vec3.fromValues(eye[0]+t[0]+tx,eye[1]+t[1]+ty,eye[2]+t[2]+tz);
    var lAt_new = vec3.fromValues(lAt[0] +t[0]+ tx, lAt[1]+t[1] + ty, lAt[2] +t[2]+ tz);
    mat4.lookAt(lookAt, eye_new, lAt_new, up);
    var xaxis = [1, 0, 0];
    var yaxis = [0, 1, 0];
    var zaxis = [0, 0, 1];
    mat4.rotate(lookAt, lookAt, d2R(rx), xaxis);
    mat4.rotate(lookAt, lookAt, d2R(ry), yaxis);
    mat4.rotate(lookAt, lookAt, d2R(rz), zaxis);
    /*
        // define the modeling matrix for the first set
        inputTriangles[0].mMatrix = mat4.create(); // modeling mat for tri set
        var setCenter = vec3.fromValues(0.25, 0.75, 0);  // center coords of tri set
        //var setCenter = vec3.fromValues(0, 0, 0);  // center coords of tri set changed!
        mat4.fromTranslation(inputTriangles[0].mMatrix, vec3.negate(vec3.create(), setCenter)); //translate to origin
        mat4.multiply(inputTriangles[0].mMatrix, mat4.fromRotation(mat4.create(), 0 * Math.PI / 4, vec3.fromValues(0, 0, 1)), inputTriangles[0].mMatrix); // rotate 90*2=180 degs
        mat4.multiply(inputTriangles[0].mMatrix, mat4.fromTranslation(mat4.create(), setCenter), inputTriangles[0].mMatrix); // move back to center
        // define the modeling matrix for the second set
        inputTriangles[1].mMatrix = mat4.create();
        var setCenter1 = vec3.fromValues(0.25, 0.25, 0);
        mat4.fromTranslation(inputTriangles[1].mMatrix, vec3.negate(vec3.create(), setCenter1)); //translate to prigin
        mat4.multiply(inputTriangles[1].mMatrix, mat4.fromScaling(mat4.create(), vec3.fromValues(1, 1, 1)), inputTriangles[1].mMatrix);//scale!!
        mat4.multiply(inputTriangles[1].mMatrix, mat4.fromRotation(mat4.create(), 0 * Math.PI / 4, vec3.fromValues(0, 0, 1)), inputTriangles[1].mMatrix); //rotation
        mat4.multiply(inputTriangles[1].mMatrix, mat4.fromTranslation(mat4.create(), setCenter1), inputTriangles[1].mMatrix); //translation back
        //mat4.multiply(inputTriangles[1].mMatrix, mat4.fromTranslation(mat4.create(), setCenter1), inputTriangles[1].mMatrix);
    */
    //Model
    mat4.identity(mMatrix);
    mat4.fromTranslation(mMatrix, vec3.negate(vec3.create(), center)); // translate to origin
    mat4.multiply(mMatrix,mat4.fromScaling(mat4.create(),s),mMatrix); //scale 
    mat4.multiply(mMatrix, mat4.fromRotation(mat4.create(), d2R(rx + r[0]), vec3.fromValues(1, 0, 0)),mMatrix); // rotate X
    mat4.multiply(mMatrix, mat4.fromRotation(mat4.create(), d2R(ry + r[1]), vec3.fromValues(0, 1, 0)), mMatrix); //rotate Y
    mat4.multiply(mMatrix, mat4.fromRotation(mat4.create(), d2R(rz + r[2]), vec3.fromValues(0, 0, 1)), mMatrix); //rotate Z
    mat4.multiply(mMatrix, mat4.fromTranslation(mat4.create(), center),mMatrix); // move back to center
/*
    //mat4.translate(mMatrix, mMatrix, vec3.negate(vec3.create(), center)); //translate based on center
    //    mat4.multiply(mMatrix, mat4.fromScaling(mat4.create(), s), mMatrix);//scale!!
    mat4.fromTranslation(mMatrix, vec3.negate(vec3.create(),center),mMatrix);
    //mat4.multiply(mMatrix, mat4.fromScaling(mat4.create(), s), mMatrix);//scale!!
    mat4.rotate(mMatrix, mMatrix, d2R(rx+r[0]), xaxis);
    mat4.rotate(mMatrix, mMatrix, d2R(ry+r[1]), yaxis);
    mat4.rotate(mMatrix, mMatrix, d2R(rz+r[2]), zaxis);
    mat4.translate(mMatrix, mMatrix, center);
  */  
    //mat4.rotate()
    mat4.mul(mMatrix, lookAt, mMatrix);
    //mat4.scale(mMatrix, mMatrix, s);
}

// setup the webGL shaders
function setupShaders() {

    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
    precision highp float;
    uniform vec3 DiffuseColorULoc;
    uniform vec3 AmbientColorULoc;
    uniform vec3 SpecularColorULoc;
    uniform float SpecPowerULoc;
    uniform float lightModel; 
    uniform vec3 LightPos;
    uniform vec3 LightCol;
    uniform vec4 eyePos;
    vec4 vertexColor; //vertexColor
    varying vec3 mPos;
    varying vec3 NormalFrag;
    float specularity;
    void main(void) {
            vec3 nNormal = normalize(NormalFrag); //calculate normalized normal     
            vec3 nLight=normalize(LightPos-mPos); //calculate normalized light
            vec3 viewVector=normalize(eyePos.xyz-mPos.xyz);
            //vec3 normal=Normal.xyz;
            float NdotL = max(dot(nNormal, nLight), 0.0);
            if(lightModel==0.0) //Blinn-Phong
            {
                //vec3 viewVector=normalize(eyePos.xyz-mPos.xyz);
                vec3 halfVector=normalize(nLight+viewVector);
                float NdotH=max(dot(nNormal,halfVector),0.0);
                specularity=clamp(pow(NdotH,SpecPowerULoc),0.0,1.0);
            }
            else //Phong
            {
                
                vec3 Reflect=normalize(reflect(-nLight,nNormal));
                float RdotV =max(dot(viewVector,Reflect),0.0);
                specularity=clamp(pow(RdotV,SpecPowerULoc),0.0,1.0);
            }
            vec3 tempColor=(DiffuseColorULoc*NdotL)+AmbientColorULoc+(SpecularColorULoc*specularity);
            vertexColor=vec4(tempColor*LightCol,1.0);            
            gl_FragColor = vertexColor;
        }
    `;

    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 vertexPosition;
        attribute vec3 vertexNormal;
        //uniform vec3 DiffuseColorULoc;
        //uniform vec3 AmbientColorULoc;
        //uniform vec3 SpecularColorULoc;
        //uniform float SpecPowerULoc;
        //uniform vec3 LightPos;
        //uniform vec3 LightCol;
        //uniform vec4 eyePos;
        //uniform float lightModel; 
        //varying highp vec4 vertexColor;
        //varying highp vec3 tempColor; //to combine the colors
        varying highp vec3 NormalFrag;
        varying highp vec3 mPos;
        uniform mat4 uModelMatrix; // the model matrix
        uniform mat4 uPerspectiveMatrix; // the perspective matrix
        uniform mat4 uNormalMatrix; //the normal matrix
        //varying highp float specularity;
        void main(void) 
        {
            gl_Position = uPerspectiveMatrix*uModelMatrix* vec4(vertexPosition, 1.0);
            vec4 mPos4=uModelMatrix*vec4(vertexPosition, 1.0);
            mPos=vec3(mPos4)/mPos4.w;
            //mPos=vec3(mPos);
            NormalFrag=vec3(uNormalMatrix*vec4(vertexNormal,1.0));
            //NormalFrag=normalize(NormalFrag);
            //for lighting
            ////////////////testing start
            //vec4 Light=normalize(vec4(LightPos,1.0)-mPos); //calculate normalized light
            //vec4 Normal = normalize(uNormalMatrix*vec4(vertexNormal,1.0)); //calculate normalized normal
            //float NdotL = max(dot(Normal,Light), 0.0);
            //vec3 nNormal=Normal.xyz;
            //vec3 nLight=Light.xyz;
            ///////////////testing end
            //vec3 nLight=normalize(LightPos-mPos.xyz); //calculate normalized light
            //tempColor=(DiffuseColorULoc*NdotL)+AmbientColorULoc;
            //vertexColor=vec4(tempColor*LightCol,1);
        }
    `;

    try {
        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader, vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution

        // console.log("fragment shader: "+fShaderCode);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader, fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);
            gl.deleteShader(fShader);
        }
        else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);
            gl.deleteShader(vShader);
        }
        else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            }
            else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                vertexPositionAttrib = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderProgram, "vertexPosition");

                vertexNormalAttrib = gl.getAttribLocation(shaderProgram, "vertexNormal");
                modelMatrixULoc = gl.getUniformLocation(shaderProgram, "uModelMatrix"); // ptr to mmat
                pMatrixULoc = gl.getUniformLocation(shaderProgram, "uPerspectiveMatrix");
                nMatrixULoc = gl.getUniformLocation(shaderProgram, "uNormalMatrix"); // ptr to mmat
                DiffuseColorULoc = gl.getUniformLocation(shaderProgram, "DiffuseColorULoc");
                AmbientColorULoc = gl.getUniformLocation(shaderProgram, "AmbientColorULoc");
                SpecularColorULoc = gl.getUniformLocation(shaderProgram, "SpecularColorULoc");
                SpecPowerULoc = gl.getUniformLocation(shaderProgram, "SpecPowerULoc");
                LightPosULoc = gl.getUniformLocation(shaderProgram, "LightPos");
                LightColULoc = gl.getUniformLocation(shaderProgram, "LightCol");
                lightModelULoc=gl.getUniformLocation(shaderProgram,"lightModel")
                EyePosULoc = gl.getUniformLocation(shaderProgram, "eyePos");
                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array
                gl.enableVertexAttribArray(vertexNormalAttrib); 
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try

    catch (e) {
        console.log(e);
    } // end catch
} // end setup shaders

/* MAIN -- HERE is where execution begins after window load */

function main() {

    setupWebGL(); // set up the webGL environment
    setupShaders(); // setup the webGL shaders
    initialize(); // all required variables for translation and rotation
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // set the screen to blac
    gl.uniform3fv(LightPosULoc, LightPos);
    gl.uniform3fv(LightColULoc, LightCol);
    gl.uniform4fv(EyePosULoc, Eye);
    loadTriangles(); // load in the triangles from tri file 
    loadSpheres();//load ellipsoids from the file
    //renderTriangles();
    document.onkeydown=KeyDown;
    document.onkeyup=KeyUp;
    refresh();

} // end main