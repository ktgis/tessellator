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

Tessellator.Model.prototype.bindSpecularMap = function (texture){
    return this.add(new Tessellator.Model.SpecularMap(texture));
};

Tessellator.Model.SpecularMap = function (texture){
    this.texture = texture;
    
    this.disposable = true;
};

Tessellator.Model.SpecularMap.prototype.dispose = function (){
    if (this.texture && this.texture.disposable){
        this.texture.dispose();
        this.texture = null;
    };
};

Tessellator.Model.SpecularMap.prototype.init = function (interpreter){
    if (this.texture){
        if (interpreter.get("draw") !== Tessellator.TEXTURE){
            throw "unable to bind a normal map if there is no texture bound first";
        };
        
        if (this.texture.constructor === String){
            this.texture = interpreter.tessellator.getTexture(this.texture);
        };
    };
    
    interpreter.flush();
};

Tessellator.Model.SpecularMap.prototype.apply = function (render, model, renderer){
    if (this.texture){
        render.addDefinition("USE_SPECULAR_MAP");
        
        render.set("specularMap", this.texture);
    }else{
        render.removeDefinition("USE_SPECULAR_MAP");
    };
};