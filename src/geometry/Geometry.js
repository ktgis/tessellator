/**
 * Copyright (c) 2015, Alexander Orzechowski.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


/**
 * Currently in beta stage. Changes can and will be made to the core mechanic
 * making this not backwards compatible.
 * 
 * Github: https://github.com/Need4Speed402/tessellator
 */

Tessellator.Geometry = function (type){
    this.positions = new Tessellator.FragmentedArray();
    this.colors = new Tessellator.FragmentedArray();
    this.normals = new Tessellator.FragmentedArray();
    this.indices = new Tessellator.FragmentedArray();
    
    this.type = type || Tessellator.TRIGANGLE;
    this.disposed = false;
};

Tessellator.Geometry.prototype.createObject = function (tessellator, drawMode, save){
    if (this.object){
        return this.object;
    };
    
    save = save || Tessellator.STATIC;
    
    this.convert();
    this.object = new Tessellator.Object(tessellator, this.type);
    
    this.object.getIndices().push(this.indices);
    this.object.setAttribute("position", Tessellator.VEC3, this.positions, Float32Array, false, save);
    
    if (this.normals.length){
        this.object.setAttribute("normal", Tessellator.VEC3, this.normals, Float32Array, false, save);
    };
    
    if (!this.colors.isEmpty()){
        if (drawMode === Tessellator.TEXTURE){
            this.object.setAttribute("color", Tessellator.VEC2, this.colors, Float32Array, false, save);
        }else{
            this.object.setAttribute("color", Tessellator.VEC4, this.colors, Uint8Array, true, save);
        };
    };
    
    this.object.upload();
    
    this.positions = null;
    this.colors = null;
    this.normals = null;
    this.indices = null;
    this.conversionArg = null;
    
    return this.object;
};

Tessellator.Geometry.prototype.getObject = function (){
    return this.object;
};

Tessellator.Geometry.prototype.dispose = function (){
    if (!this.disposed){
        if (this.object){
            this.object.dispose();
        }else{
            this.positions = null;
            this.colors = null;
            this.normals = null;
            this.indices = null;
        };
        
        this.disposed = true;
    };
};

//for models
Tessellator.Geometry.prototype.apply = function (matrix){
    if (this.type !== Tessellator.TRIANGLE){
        matrix.removeDefinition("USE_LIGHTING");
    };
    
    if (this.object){
        this.object.render(matrix);
    };
};

Tessellator.Geometry.prototype.addPositions = function (pos){
    if (!this.matrix){
        this.positions.push(pos);
    }else for (var i = 0; i < pos.length; i += 3){
        this.positions.push(Tessellator.vec3(pos[i], pos[i + 1], pos[i + 2]).multipy(this.matrix))
    };
};

Tessellator.Geometry.prototype.setColor = function (){
    this.color = Tessellator.getColor(arguments);
};

Tessellator.Geometry.prototype.setVertex = function (){
    if (arguments.length === 1){
        this.addPositions(arguments[0]);
        
        if (this.color){
            for (var i = 0, k = arguments[0].length; i < k; i += 3){
                this.colors.push(this.color);
            };
        };
    }else{
        this.addPositions(arguments);
        
        if (this.color){
            for (var i = 0, k = arguments.length; i < k; i += 3){
                this.colors.push(this.color);
            };
        };
    };
};

Tessellator.Geometry.prototype.generateTextureCoordinates = function (x, y){
    this.convert();
    
    if (this.colors.isEmpty() && this.type === Tessellator.TRIANGLE){
        var tex = new Float32Array(this.positions.length / 3 * 2);
        
        var indices = this.indices.combine();
        
        for (var i = 0; i < indices.length / 3; i++){
            var ia = indices[i * 3 + 0],
                ib = indices[i * 3 + 1],
                ic = indices[i * 3 + 2];
            
            if ((i % 2) === 0){
                tex[ia * 2 + 0] = 0;
                tex[ia * 2 + 1] = 0;
                
                tex[ib * 2 + 0] = x;
                tex[ib * 2 + 1] = 0;
                
                tex[ic * 2 + 0] = x;
                tex[ic * 2 + 1] = y;
            }else{
                tex[ia * 2 + 0] = 0;
                tex[ia * 2 + 1] = 0;
                
                tex[ib * 2 + 0] = x;
                tex[ib * 2 + 1] = y;
                
                tex[ic * 2 + 0] = 0;
                tex[ic * 2 + 1] = y;
            };
        };
        
        this.colors.push(tex);
    };
};

Tessellator.Geometry.prototype.createWireFrame = function (){
    this.convert();
    
    if (this.type === Tessellator.TRIANGLE){
        var newIndices = new Tessellator.Array();
        var indices = this.indices.combine();
        
        for (var i = 0; i < indices.length; i += 3){
            var a = indices[i + 0],
                b = indices[i + 1],
                c = indices[i + 2];
            
            newIndices.push([
                a, b,
                b, c,
                c, a
            ]);
        };
        
        this.indices = newIndices;
        this.type = Tessellator.LINES;
    };
};

Tessellator.Geometry.prototype.generateNormals = function (){
    this.convert();
    
    if (this.normals.isEmpty() && this.type === Tessellator.TRIANGLE){
        var positions = this.positions.compress();
        var normals = new Float32Array(this.positions.length);
        
        var indices = this.indices.combine();
        
        for (var i = 0; i < indices.length; i += 3){
            var ia = indices[i + 0],
                ib = indices[i + 1],
                ic = indices[i + 2];
            
            var x1 = positions[ia * 3 + 0],
                y1 = positions[ia * 3 + 1],
                z1 = positions[ia * 3 + 2],
                
                x2 = positions[ib * 3 + 0],
                y2 = positions[ib * 3 + 1],
                z2 = positions[ib * 3 + 2],
                
                x3 = positions[ic * 3 + 0],
                y3 = positions[ic * 3 + 1],
                z3 = positions[ic * 3 + 2];
            
            //deltas
            var Ux = x2 - x1,
                Uy = y2 - y1,
                Uz = z2 - z1,
                
                Vx = x3 - x1,
                Vy = y3 - y1,
                Vz = z3 - z1;
            
            //normals
            var Nx = (Uy * Vz) - (Uz * Vy),
                Ny = (Uz * Vx) - (Ux * Vz),
                Nz = (Ux * Vy) - (Uy * Vx);
            
            normals[ia * 3 + 0] = Nx;
            normals[ia * 3 + 1] = Ny;
            normals[ia * 3 + 2] = Nz;
                
            normals[ib * 3 + 0] = Nx;
            normals[ib * 3 + 1] = Ny;
            normals[ib * 3 + 2] = Nz;
                
            normals[ic * 3 + 0] = Nx;
            normals[ic * 3 + 1] = Ny;
            normals[ic * 3 + 2] = Nz;
        };
        
        this.normals.push(normals);
    };
};

Tessellator.Geometry.prototype.translate = function (vec){
    if (!this.matrix){
        this.matrix = Tessellator.mat4();
    };
    
    this.matrix.translate(vec);
};

Tessellator.Geometry.prototype.rotate = function (r, vec){
    if (!this.matrix){
        this.matrix = Tessellator.mat4();
    };
    
    this.matrix.rotate(r, vec);
};

Tessellator.Geometry.prototype.scale = function (vec){
    if (!this.matrix){
        this.matrix = Tessellator.mat4();
    };
    
    this.matrix.scale(vec);
};

Tessellator.Geometry.prototype.align = function (vec, up){
    if (!this.matrix){
        this.matrix = Tessellator.mat4();
    };
    
    if (!up){
        this.matrix.align(vec, Tessellator.vec3(0, 1, 0));
    }else{
        this.matrix.align(vec, up);
    };
};

Tessellator.Geometry.prototype.canConvertTo = function (to){
    var g = Tessellator.Geometry.CUSTOM_GEOMETRY_REGISTER;
    
    for (var i = 0; i <= g.length; i++){
        if (i === g.length) return false;
        
        var converter = g[i];
        
        if (converter[0] === this.type && converter[1] === to){
            return true;
        };
    };

    return false;
};
Tessellator.Geometry.prototype.canConvertTo = function (to){
    var g = Tessellator.Geometry.CUSTOM_GEOMETRY_REGISTER;
    
    for (var i = 0; i < g.length; i++){
        var converter = g[i];
        
        if (converter[0] === this.type && converter[1] === to){
            return true;
        };
    };

    return false;
};

Tessellator.Geometry.prototype.convert = function (){
    var g = Tessellator.Geometry.CUSTOM_GEOMETRY_REGISTER;
    
    for (var i = 0; i < g.length; i++){
        var converter = g[i];
        
        if (converter[0] === this.type){
            this.type = converter[1];
            
            converter[2](this);
            
            return true;
        };
    };

    return false;
};

Tessellator.Geometry.prototype.add = function (newGeometry, arg){
    if (this.type === newGeometry.type && newGeometry.indices.length + this.indices.length <= Tessellator.VERTEX_LIMIT){
        newGeometry.indices.compress();
        newGeometry.indices.offset(this.positions.length / 3);
        
        this.forceAdd(newGeometry);
        
        return true;
    };
    
    return false;
};

Tessellator.Geometry.prototype.forceAdd = function (newGeometry){
    this.positions.push(newGeometry.positions);
    this.colors.push(newGeometry.colors);
    this.normals.push(newGeometry.normals);
    this.indices.push(newGeometry.indices);
};

Tessellator.Geometry.registerCustomGeometry = function (from, to, editor){
    var g = Tessellator.Geometry.CUSTOM_GEOMETRY_REGISTER;
    
    for (var i = 0; i < g.length; i++){
        if (g[i][0] === from && g[i][1] === to){
            g[i][2] = editor;
            
            return;
        };
    };
    
    g.push([from, to, editor]);
};

Tessellator.Geometry.CUSTOM_GEOMETRY_REGISTER = [];