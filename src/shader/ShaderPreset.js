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

Tessellator.ShaderPreset = function (){
    if (arguments.length === 2){
        this.configureCreate(arguments[0], arguments[1]);
    }else{
        this.create = arguments[0];
    };
};

Tessellator.ShaderPreset.prototype.configureCreate = function (type, code){
    this.shaders = [];
    this.type = type;
    this.code = code;
    
    this.create = function (tessellator){
        for (var i = 0; i < this.shaders.length; i++){
            if (this.shaders[i][0] === tessellator){
                return this.shaders[i][1];
            };
        };
        
        var shader = new Tessellator.Shader(tessellator, type).load(code);
        
        this.shaders.push([tessellator, shader]);
        
        return shader;
    };
};

Tessellator.ShaderPreset.prototype.configureActiveProgram = function (vert, frag){
    var cache = [];
    this.cache = cache;
    
    this.create = function (tessellator){
        for (var i = 0; i < cache.length; i++){
            if (cache[i][0] === tessellator){
                return cache[i][1];
            };
        };
        
        var prog = new Tessellator.ActiveProgram(tessellator.createShaderProgram(vert, frag));
        
        cache.push([tessellator, prog]);
        
        return prog;
    };
    
    return this;
};

Tessellator.ShaderPreset.prototype.configureStandardPair = function (svert, sfrag){
    this.create = function (tessellator) {
        return tessellator.createShaderProgram(svert, sfrag);
    };
    
    return this;
};

Tessellator.PIXEL_SHADER_VERTEX_SHADER = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "precision lowp float;attribute vec2 position;uniform vec2 aspect;varying vec2 texturePos;void main(void){texturePos=(position+1.0)/2.0;gl_Position=vec4(position*(aspect+1.),0.0,1.0);}");
Tessellator.PIXEL_SHADER_VERTEX_UV_SHADER = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "precision lowp float;attribute vec2 position,uv;uniform vec2 aspect;varying vec2 texturePos;void main(void){texturePos=uv;gl_Position=vec4(position*(aspect+1.),0.0,1.0);}");
Tessellator.ATLAS_ANIMATION_VERTEX_SHADER = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "precision lowp float;attribute vec2 position;attribute vec2 textureCoord;varying vec2 texturePos;void main(void){texturePos=textureCoord;gl_Position=vec4(position,0.0,1.0);}");
Tessellator.ATLAS_VERTEX_SHADER = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "precision lowp float;attribute vec2 position;uniform vec2 atlasDims;uniform vec2 atlas;varying vec2 texturePos;void main(void){texturePos=(position+1.0)/2.0;gl_Position=vec4((atlas+texturePos)/atlasDims*2.0-1.0,0.0,1.0);}");

Tessellator.PIXEL_SHADER_BLACK = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;void main(void){gl_FragColor=vec4(0,0,0,1);}");
Tessellator.PIXEL_SHADER_WHITE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;void main(void){gl_FragColor=vec4(1,1,1,1);}");
Tessellator.PIXEL_SHADER_COLOR = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;uniform vec4 color;varying vec2 texturePos;void main(void){gl_FragColor=color;}");
Tessellator.PIXEL_SHADER_PASS = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,texturePos);}");
Tessellator.PIXEL_SHADER_RGB = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=vec4(texture2D(sampler,texturePos).xyz,1);}");
Tessellator.PIXEL_SHADER_FLIP_X = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,vec2(1.-texturePos.x,texturePos.y));}");
Tessellator.PIXEL_SHADER_FLIP_Y = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,vec2(texturePos.x,1.-texturePos.y));}");
Tessellator.PIXEL_SHADER_BLACK_AND_WHITE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);float color=(o.x+o.y+o.z)/3.0;gl_FragColor=vec4(color,color,color,o.w);}");
Tessellator.PIXEL_SHADER_INVERT_COLOR = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(1.0-o.xyz,o.w);}");
Tessellator.PIXEL_SHADER_FILTER = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform vec3 mask;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);float color=(o.x*mask.x+o.y*mask.y+o.z*mask.z)/(mask.x+mask.y+mask.z);gl_FragColor=vec4(vec3(color)*mask, o.w);}");
Tessellator.PIXEL_SHADER_MASK = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform vec4 mask;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=o*mask;}");
Tessellator.PIXEL_SHADER_RED_FILTER = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(o.x,0,0,o.w);}");
Tessellator.PIXEL_SHADER_GREEN_FILTER = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(0,o.y,0,o.w);}");
Tessellator.PIXEL_SHADER_BLUE_FILTER = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(0,0,o.z,o.w);}");
Tessellator.PIXEL_SHADER_QUALITY_FILTER = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;uniform float quality;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(floor(o.xyz*quality+0.5)/quality,o.w);}");
Tessellator.PIXEL_SHADER_NOISE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;uniform sampler2D sampler;uniform float time,intensity;uniform vec2 window;varying vec2 texturePos;float rand(vec2 co){return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);}float rand(float m){return tan(rand(vec2(gl_FragCoord.x/window.x*cos(time)*3.243,gl_FragCoord.y/window.y/tan(time*5.9273)*.918)*m));}void main(void){vec4 c=texture2D(sampler,texturePos);c.xyz+=(vec3(rand(1.+c.z),rand(1.72+c.x),rand(.829+c.y))*2.-1.)*intensity;gl_FragColor=c;}");
Tessellator.PIXEL_SHADER_BWNOISE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;uniform sampler2D sampler;uniform float time,intensity;uniform vec2 window;varying vec2 texturePos;float rand(vec2 co){return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);}float rand(float m){return tan(rand(vec2(gl_FragCoord.x/window.x*cos(time)*3.243,gl_FragCoord.y/window.y/tan(time*5.9273)*.918)*m));}void main(void){vec4 c=texture2D(sampler,texturePos);c.xyz+=(vec3(rand(1.+dot(c.xyz, cross(c.yxz, c.zyx))))*2.-1.)*intensity;gl_FragColor=c;}");
Tessellator.PIXEL_SHADER_TRANSLATE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform mat2 translate;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,(texturePos*2.-1.)*translate/2.+.5);}");
Tessellator.PIXEL_SHADER_DEPTH = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;float unpackFloat(vec4 value){return dot(value,vec4(1./(256.*256.*256.),1./(256.*256.),1./256.,1.));}void main(void){gl_FragColor=vec4(vec3(unpackFloat(texture2D(sampler,texturePos))),1.);}");
Tessellator.PIXEL_SHADER_NEAREST_ALPHA = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 c=texture2D(sampler,texturePos);if(c.w>.5){c.w=1.;}else{c.w=0.;}gl_FragColor=c;}");
Tessellator.PIXEL_SHADER_NEAREST_COLOR = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 c=texture2D(sampler,texturePos);float a=(c.x+c.y+c.z)/3.;if(a>.5){c.xyz/=a;c.w=1.;}else{c.xyz=vec3(0);a=0.;}gl_FragColor=c;}");
Tessellator.PIXEL_SHADER_TWIST = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;uniform float radius,intensity;uniform vec2 center;void main(void){vec2 tc=(texturePos*2.-1.)-center;float dist=length(tc);if(dist<radius){float p=(radius-dist)/radius;float t=p*p*intensity;float s=sin(t),c=cos(t);tc=vec2(dot(tc,vec2(c,-s)),dot(tc,vec2(s,c)));}tc=(tc+center)/2.+.5;gl_FragColor=texture2D(sampler, tc);}");

Tessellator.PIXEL_SHADER_CUBE_MAP = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform mat4 perspective;uniform samplerCube sampler;void main(void){vec4 pos=vec4(texturePos*2.-1.,1,1)*perspective;gl_FragColor=textureCube(sampler,pos.xyz/pos.w);}");

Tessellator.PIXEL_SHADER_BLEND = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform float weight;uniform sampler2D sampler,sampler2;void main(void){gl_FragColor=texture2D(sampler,texturePos)*(1.-weight)+texture2D(sampler2,texturePos)*weight;}");
Tessellator.PIXEL_SHADER_SLIDE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform float weight;uniform sampler2D sampler,sampler2;void main(void){vec2 pos=texturePos;pos.x+=weight;if(pos.x<1.){gl_FragColor=texture2D(sampler,pos);}else{gl_FragColor=texture2D(sampler2,vec2(texturePos.x-(1.-weight),texturePos.y));}}");
Tessellator.PIXEL_SHADER_SLIDE_IN = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform float weight;uniform sampler2D sampler,sampler2;void main(void){gl_FragColor=texture2D(sampler,texturePos);if(texturePos.x+weight>1.){gl_FragColor=texture2D(sampler2,vec2(texturePos.x-(1.-weight),texturePos.y));}}");
Tessellator.PIXEL_SHADER_SLICE_IN = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform float weight;uniform sampler2D sampler,sampler2;uniform vec2 window;void main(void){gl_FragColor=texture2D(sampler,texturePos);bool dir=int(mod(gl_FragCoord.y/window.y*8.,2.))==0;if(dir?texturePos.x-weight<0.:texturePos.x+weight>1.){gl_FragColor=texture2D(sampler2,vec2(dir?texturePos.x+(1.-weight):texturePos.x-(1.-weight),texturePos.y));}}");
Tessellator.PIXEL_SHADER_RADIAL = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform vec2 window;uniform float weight;uniform sampler2D sampler,sampler2;void main(void){vec2 cube=(gl_FragCoord.xy/window*2.-1.);if(length(cube)>weight*sqrt(2.)){gl_FragColor=texture2D(sampler,texturePos);}else{gl_FragColor=texture2D(sampler2, texturePos);}}");

Tessellator.PIXEL_SHADER_BLUR = new Tessellator.ShaderPreset(function (tessellator, resX, resY){
    return tessellator.createPixelShader("precision highp float;const int resX=" + (resX | 5) + ",resY=" + (resY | 4) + ";uniform float intensity;const float TAU=atan(1.0)*8.0;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 color=texture2D(sampler,texturePos);int index=1;for(int y=1;y<=resY;y++){float len=float(y)/float(resY)*intensity;for(int x=0;x<resX;x++){index++;float rad=float(x)/float(resX)*TAU;color+=texture2D(sampler,texturePos+vec2(sin(rad),cos(rad))*len/16.0);}}gl_FragColor=color/float(index);}");
});

Tessellator.ATLAS_SHADER = new Tessellator.ShaderPreset().configureStandardPair(
    Tessellator.ATLAS_VERTEX_SHADER,
    Tessellator.PIXEL_SHADER_MASK
    
);

Tessellator.ATLAS_SHADER_ANIMATION = new Tessellator.ShaderPreset().configureStandardPair(
    Tessellator.ATLAS_ANIMATION_VERTEX_SHADER,
    Tessellator.PIXEL_SHADER_PASS
);

Tessellator.MODEL_FRAGMENT_LIGHTING_VERTEX_SHADER = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "attribute vec3 position;uniform mat4 mvMatrix;uniform mat4 pMatrix;varying vec4 mvPosition;\r\n#ifdef USE_TEXTURE\r\nattribute vec2 color;varying vec2 colorInfo;\r\n#else\r\nattribute vec4 color;varying vec4 colorInfo;\r\n#endif\r\n#if defined(USE_LIGHTING) || defined(USE_REFLECTION_CUBE)\r\nattribute vec3 normal;uniform mat3 nMatrix;varying vec3 lightNormal;\r\n#endif\r\nvoid main(void){\r\n#ifdef FLATTEN_MATRIX\r\nmvPosition=mvMatrix*vec4(0,0,0,1)+vec4(position,0);\r\n#else\r\nmvPosition=mvMatrix*vec4(position,1);\r\n#endif\r\ngl_Position=pMatrix*mvPosition;\r\n#if defined(USE_LIGHTING) || defined(USE_REFLECTION_CUBE)\r\nlightNormal=normalize(nMatrix*normal);\r\n#endif\r\ncolorInfo=color;}");
Tessellator.MODEL_FRAGMENT_LIGHTING_FRAGMENT_SHADER = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision mediump float;uniform vec2 window;uniform vec4 mask;\r\n#ifdef USE_SCISSOR\r\nuniform vec4 scissor;\r\n#endif\r\n#ifdef USE_TEXTURE\r\nuniform sampler2D texture;varying vec2 colorInfo;\r\n#else\r\nvarying vec4 colorInfo;\r\n#endif\r\n#ifdef USE_REFLECTION_CUBE\r\nuniform float reflectionIntensity;uniform samplerCube reflectionCube;\r\n#endif\r\n#ifdef USE_FOG\r\nuniform vec2 fog;uniform vec3 fogColor;\r\n#endif\r\nvarying vec4 mvPosition;\r\n#if defined(USE_LIGHTING) || defined(USE_REFLECTION_CUBE)\r\nvarying vec3 lightNormal;\r\n#endif\r\n#ifdef USE_LIGHTING\r\n#ifdef USE_SPECULAR_REFLECTION\r\nuniform float specular;\r\n#ifdef USE_SPECULAR_MAP\r\nuniform sampler2D specularMap;\r\n#endif\r\n#endif\r\n#ifdef USE_NORMAL_MAP\r\nuniform sampler2D normalTexture;\r\n#endif\r\nuniform sampler2D lights,shadowMap;\r\n#ifdef TEXTURE_CUBE_1\r\nuniform samplerCube cube1;\r\n#endif\r\n#ifdef TEXTURE_CUBE_2\r\nuniform samplerCube cube2;\r\n#endif\r\n#ifdef TEXTURE_CUBE_3\r\nuniform samplerCube cube3;\r\n#endif\r\n#ifdef TEXTURE_CUBE_4\r\nuniform samplerCube cube4;\r\n#endif\r\n#ifdef TEXTURE_CUBE_5\r\nuniform samplerCube cube5;\r\n#endif\r\n#ifdef TEXTURE_CUBE_6\r\nuniform samplerCube cube6;\r\n#endif\r\n#ifdef TEXTURE_CUBE_7\r\nuniform samplerCube cube7;\r\n#endif\r\n#ifdef TEXTURE_CUBE_8\r\nuniform samplerCube cube8;\r\n#endif\r\nfloat unpackFloat(vec4 value){return dot(value,vec4(1.0/(256.0*256.0*256.0),1.0/(256.0*256.0),1.0/256.0,1.0));}vec4 getCube(int cube,vec3 pos){\r\n#ifdef TEXTURE_CUBE_1\r\nif(cube==1)return textureCube(cube1,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_2\r\nif(cube==2)return textureCube(cube2,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_3\r\nif(cube==3)return textureCube(cube3,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_4\r\nif(cube==4)return textureCube(cube4,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_5\r\nif(cube==5)return textureCube(cube5,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_6\r\nif(cube==6)return textureCube(cube6,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_7\r\nif(cube==7)return textureCube(cube7,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_8\r\nif(cube==8)return textureCube(cube8,pos);\r\n#endif\r\nreturn vec4(0);}\r\n#ifdef USE_SPECULAR_REFLECTION\r\nvec3 getLightMask(vec3 normal,float specular){\r\n#else\r\nvec3 getLightMask(vec3 normal){\r\n#endif\r\nvec3 lightMask=vec3(0);for(float i=0.0;i<256.;i++){vec4 light0=texture2D(lights,vec2(0./4.,i/256.));int type=int(light0.x);vec3 color=light0.yzw;if(type==0){lightMask+=color;break;}else if(type==1){lightMask+=color;}else if(type==2){vec3 dir=texture2D(lights,vec2(1./4.,i/256.)).xyz;float intensity=max(0.,dot(normal,dir));vec4 shadow=texture2D(lights,vec2(3./4.,i/256.));if(shadow.x>.5){vec2 view=shadow.ww*vec2(0.1,2);vec3 u=dir,r,b;if(abs(dir[0])>abs(dir[2])){r=normalize(cross(u,vec3(0,0,1)));}else{r=normalize(cross(u,vec3(1,0,0)));}b=cross(r,u);vec2 norm=(mvPosition.xyz*mat3(b.x,r.x,u.x,b.y,r.y,u.y,b.z,r.z,u.z)).xy;float depthMap=unpackFloat(texture2D(shadowMap,-norm/shadow.yz/2.+.5));float depth=(dot(dir,mvPosition.xyz+dir*shadow.w)-view.x)/(view.y-view.x)-0.07/(shadow.w/100.);if(depthMap>=depth){intensity=0.;}}lightMask+=color*intensity;}else if(type==3){vec3 pos=texture2D(lights,vec2(1./4.,i/256.)).xyz;vec4 shadow=texture2D(lights,vec2(3./4.,i/256.));vec3 dist=pos-mvPosition.xyz;float len=length(dist);vec3 npos=dist/len;float angle=max(0.0,dot(normal,npos));float intensity=angle;\r\n#ifdef USE_SPECULAR_REFLECTION\r\nintensity+=pow(max(0.,dot(reflect(-npos,normal),normalize(-mvPosition.xyz))),specular);\r\n#endif\r\nif(shadow.x>.5){float mapLen=unpackFloat(getCube(int(shadow.x),npos*vec3(1,-1,1)));float thisLen=(len-shadow.y)/(shadow.z-shadow.y);if(thisLen>=mapLen+shadow.w/angle){intensity*=0.0;}}lightMask+=color*intensity;}else if(type==4){vec4 light1=texture2D(lights,vec2(1./4.,i/256.));vec4 shadow=texture2D(lights,vec2(3./4.,i/256.));vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float len=length(dist);if(range>=len){vec3 npos=dist/len;float angle=max(0.0,dot(normal,npos));float intensity=angle;\r\n#ifdef USE_SPECULAR_REFLECTION\r\nintensity+=pow(max(0.,dot(reflect(-npos,normal),normalize(-mvPosition.xyz))),specular);\r\n#endif\r\nif(shadow.x>.5){float mapLen=unpackFloat(getCube(int(shadow.x),npos*vec3(1,-1,1)));float thisLen=(len-shadow.y)/(shadow.z-shadow.y);if(thisLen>=mapLen+shadow.w/angle){intensity*=0.0;}}lightMask+=color*intensity*((range-len)/range);}}else if(type==5){vec4 light1=texture2D(lights,vec2(1./4.,i/256.));vec4 light2=texture2D(lights,vec2(2./4.,i/256.));vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,normal);float specularLight=0.0;\r\n#ifdef USE_SPECULAR_REFLECTION\r\nspecularLight=pow(max(0.,dot(reflect(-npos,normal),normalize(-mvPosition.xyz))),specular);\r\n#endif\r\nfloat intensity=max(0.,dot(normal,npos))+specularLight;lightMask+=color*intensity;}}else if(type==6){vec4 light1=texture2D(lights,vec2(1./4.,i/256.));vec4 light2=texture2D(lights,vec2(2./4.,i/256.));vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=length(dist);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,normal);float specularLight=0.0;\r\n#ifdef USE_SPECULAR_REFLECTION\r\nspecularLight=pow(max(0.,dot(reflect(-npos,normal),normalize(-mvPosition.xyz))),specular);\r\n#endif\r\nfloat intensity=max(0.,dot(normal,npos))+specularLight;lightMask+=color*intensity*((range-length)/range);}}}return lightMask;}\r\n#endif\r\nvoid main(void){\r\n#ifdef USE_SCISSOR\r\nvec2 area=gl_FragCoord.xy/window;if(area.x<scissor.x||area.y<scissor.y||scissor.x+scissor.z<area.x||scissor.y+scissor.w<area.y){discard;}\r\n#endif\r\n#ifdef USE_TEXTURE\r\nvec2 tex=mod(colorInfo,1.);vec4 mainColor=texture2D(texture,tex);\r\n#else\r\nvec4 mainColor=colorInfo;\r\n#endif\r\nmainColor*=mask;if(mainColor.w==0.0){discard;}else{\r\n#ifdef USE_LIGHTING\r\nvec3 normal=lightNormal;\r\n#ifdef USE_NORMAL_MAP\r\nvec3 z=normalize(texture2D(normalTexture,tex).xyz*2.-1.);vec3 x=normalize(cross(z,vec3(0,-1,0)));vec3 y=normalize(cross(z,x));normal*=mat3(x.x,y.x,z.x,x.y,y.y,z.y,x.z,y.z,z.z);\r\n#endif\r\n#ifdef USE_SPECULAR_REFLECTION\r\nfloat reflection=specular;\r\n#ifdef USE_SPECULAR_MAP\r\nreflection*=texture2D(specularMap,tex).x;\r\n#endif\r\nmainColor.xyz*=getLightMask(normal,reflection);\r\n#else\r\nmainColor.xyz*=getLightMask(normal);\r\n#endif\r\n#ifdef USE_REFLECTION_CUBE\r\nmainColor=mainColor*(1.-reflectionIntensity)+textureCube(reflectionCube,reflect(-normalize(mvPosition.xyz),normal))*reflectionIntensity;\r\n#endif\r\n#elif defined(USE_REFLECTION_CUBE)\r\nmainColor=mainColor*(1.-reflectionIntensity)+textureCube(reflectionCube,reflect(normalize(mvPosition.xyz),lightNormal*vec3(-1,1,1)))*reflectionIntensity;\r\n#endif\r\n#ifdef USE_FOG\r\nfloat fogLerp=clamp((length(mvPosition.xyz)-fog.x)/(fog.y-fog.x),0.,1.);mainColor.xyz=mainColor.xyz*(1.-fogLerp)+fogColor*fogLerp;\r\n#endif\r\ngl_FragColor=mainColor;}}");

Tessellator.MODEL_FRAGMENT_LIGHTING_SHADER = new Tessellator.ShaderPreset().configureActiveProgram(
    Tessellator.MODEL_FRAGMENT_LIGHTING_VERTEX_SHADER,
    Tessellator.MODEL_FRAGMENT_LIGHTING_FRAGMENT_SHADER
);

Tessellator.MODEL_VERTEX_LIGHTING_VERTEX_SHADER = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "attribute vec3 position;uniform mat4 mvMatrix;uniform mat4 pMatrix;varying vec4 mvPosition;\r\n#ifdef USE_TEXTURE\r\nattribute vec2 color;varying vec2 colorInfo;\r\n#else\r\nattribute vec4 color;varying vec4 colorInfo;\r\n#endif\r\n#ifdef USE_REFLECTION_CUBE\r\nvarying vec3 lightNormal;\r\n#endif\r\n#if defined(USE_LIGHTING) || defined(USE_REFLECTION_CUBE)\r\nattribute vec3 normal;\r\n#endif\r\n#ifdef USE_LIGHTING\r\n#define LIGHTING_EPSILON 0.0005\r\n#define LIGHTING_MAX_ANGLE_INFUANCE 0.5\r\nvarying vec3 lightMask;\r\n#ifdef USE_SPECULAR_REFLECTION\r\nuniform float specular;\r\n#endif\r\nuniform mat3 nMatrix;uniform sampler2D lights,shadowMap;\r\n#ifdef TEXTURE_CUBE_1\r\nuniform samplerCube cube1;\r\n#endif\r\n#ifdef TEXTURE_CUBE_2\r\nuniform samplerCube cube2;\r\n#endif\r\n#ifdef TEXTURE_CUBE_3\r\nuniform samplerCube cube3;\r\n#endif\r\n#ifdef TEXTURE_CUBE_4\r\nuniform samplerCube cube4;\r\n#endif\r\n#ifdef TEXTURE_CUBE_5\r\nuniform samplerCube cube5;\r\n#endif\r\n#ifdef TEXTURE_CUBE_6\r\nuniform samplerCube cube6;\r\n#endif\r\n#ifdef TEXTURE_CUBE_7\r\nuniform samplerCube cube7;\r\n#endif\r\n#ifdef TEXTURE_CUBE_8\r\nuniform samplerCube cube8;\r\n#endif\r\nfloat unpackFloat(vec4 value){return dot(value,vec4(1.0/(256.0*256.0*256.0),1.0/(256.0*256.0),1.0/256.0,1.0));}vec4 getCube(int cube,vec3 pos){\r\n#ifdef TEXTURE_CUBE_1\r\nif(cube==1)return textureCube(cube1,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_2\r\nif(cube==2)return textureCube(cube2,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_3\r\nif(cube==3)return textureCube(cube3,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_4\r\nif(cube==4)return textureCube(cube4,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_5\r\nif(cube==5)return textureCube(cube5,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_6\r\nif(cube==6)return textureCube(cube6,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_7\r\nif(cube==7)return textureCube(cube7,pos);\r\n#endif\r\n#ifdef TEXTURE_CUBE_8\r\nif(cube==8)return textureCube(cube8,pos);\r\n#endif\r\nreturn vec4(0);}\r\n#ifdef USE_SPECULAR_REFLECTION\r\nvec3 getLightMask(vec3 normal,float specular){\r\n#else\r\nvec3 getLightMask(vec3 normal){\r\n#endif\r\nvec3 lightMask=vec3(0);for(float i=0.0;i<256.;i++){vec4 light0=texture2D(lights,vec2(0./4.,i/256.));int type=int(light0.x);vec3 color=light0.yzw;if(type==0){lightMask+=color;break;}else if(type==1){lightMask+=color;}else if(type==2){vec3 dir=texture2D(lights,vec2(1./4.,i/256.)).xyz;float intensity=max(0.,dot(normal,dir));vec4 shadow=texture2D(lights,vec2(3./4.,i/256.));if(shadow.x>.5){vec3 pos=texture2D(lights,vec2(2./4.,i/256.)).xyz;lightMask=vec3(length(shadow.w-mvPosition.xyz*dir))/50.;/*npos.xy=npos.xy/shadow.yz*4.+.5;vec2 depthMap=texture2D(shadowMap,npos.xy).xw;float depth=abs(depthMap.x-npos.z);lightMask=vec3(depth);*/}else{lightMask+=color*intensity;}}else if(type==3){vec3 pos=texture2D(lights,vec2(1./4.,i/256.)).xyz;vec4 shadow=texture2D(lights,vec2(3./4.,i/256.));vec3 dist=pos-mvPosition.xyz;float len=length(dist);vec3 npos=dist/len;float angle=max(0.0,dot(normal,npos));float intensity=angle;\r\n#ifdef USE_SPECULAR_REFLECTION\r\nintensity+=pow(max(0.,dot(reflect(-npos,normal),normalize(-mvPosition.xyz))),specular);\r\n#endif\r\nif(shadow.x>.5){float mapLen=unpackFloat(getCube(int(shadow.x),npos*vec3(1,-1,1)));float thisLen=(len-shadow.y)/(shadow.z-shadow.y);if(thisLen>=mapLen+LIGHTING_EPSILON/max(angle,LIGHTING_MAX_ANGLE_INFUANCE)){intensity*=0.0;}}lightMask+=color*intensity;}else if(type==4){vec4 light1=texture2D(lights,vec2(1./4.,i/256.));vec4 shadow=texture2D(lights,vec2(3./4.,i/256.));vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float len=length(dist);if(range>=len){vec3 npos=dist/len;float angle=max(0.0,dot(normal,npos));float intensity=angle;\r\n#ifdef USE_SPECULAR_REFLECTION\r\nintensity+=pow(max(0.,dot(reflect(-npos,normal),normalize(-mvPosition.xyz))),specular);\r\n#endif\r\nif(shadow.x>.5){float mapLen=unpackFloat(getCube(int(shadow.x),npos*vec3(1,-1,1)));float thisLen=(len-shadow.y)/(shadow.z-shadow.y);if(thisLen>=mapLen+LIGHTING_EPSILON/max(angle,LIGHTING_MAX_ANGLE_INFUANCE)){intensity*=0.0;}}lightMask+=color*intensity*((range-len)/range);}}else if(type==5){vec4 light1=texture2D(lights,vec2(1./4.,i/256.));vec4 light2=texture2D(lights,vec2(2./4.,i/256.));vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,normal);float specularLight=0.0;\r\n#ifdef USE_SPECULAR_REFLECTION\r\nspecularLight=pow(max(0.,dot(reflect(-npos,normal),normalize(-mvPosition.xyz))),specular);\r\n#endif\r\nfloat intensity=max(0.,dot(normal,npos))+specularLight;lightMask+=color*intensity;}}else if(type==6){vec4 light1=texture2D(lights,vec2(1./4.,i/256.));vec4 light2=texture2D(lights,vec2(2./4.,i/256.));vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=length(dist);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,normal);float specularLight=0.0;\r\n#ifdef USE_SPECULAR_REFLECTION\r\nspecularLight=pow(max(0.,dot(reflect(-npos,normal),normalize(-mvPosition.xyz))),specular);\r\n#endif\r\nfloat intensity=max(0.,dot(normal,npos))+specularLight;lightMask+=color*intensity*((range-length)/range);}}}return lightMask;}\r\n#endif\r\nvoid main(void){\r\n#ifdef FLATTEN_MATRIX\r\nmvPosition=mvMatrix*vec4(0,0,0,1)+vec4(position,0);\r\n#else\r\nmvPosition=mvMatrix*vec4(position,1);\r\n#endif\r\ngl_Position=pMatrix*mvPosition;\r\n#ifdef USE_REFLECTION_CUBE\r\nlightNormal=normal;\r\n#endif\r\ncolorInfo=color;\r\n#ifdef USE_LIGHTING\r\nvec3 norm=normalize(nMatrix*normal);\r\n#ifdef USE_SPECULAR_REFLECTION\r\nlightMask=getLightMask(norm,specular);\r\n#else\r\nlightMask=getLightMask(norm);\r\n#endif\r\n#endif\r\n}");
Tessellator.MODEL_VERTEX_LIGHTING_FRAGMENT_SHADER = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision mediump float;varying vec4 mvPosition;uniform vec2 window;uniform vec4 mask;\r\n#ifdef USE_SCISSOR\r\nuniform vec4 scissor;\r\n#endif\r\n#ifdef USE_REFLECTION_CUBE\r\nuniform float reflectionIntensity;uniform samplerCube reflectionCube;varying vec3 lightNormal;\r\n#endif\r\n#ifdef USE_TEXTURE\r\nuniform sampler2D texture;varying vec2 colorInfo;\r\n#else\r\nvarying vec4 colorInfo;\r\n#endif\r\n#ifdef USE_LIGHTING\r\nvarying vec3 lightMask;\r\n#endif\r\n#ifdef USE_FOG\r\nuniform vec2 fog;uniform vec3 fogColor;\r\n#endif\r\nvoid main(void){\r\n#ifdef USE_SCISSOR\r\nvec2 area=gl_FragCoord.xy/window;if(area.x<scissor.x||area.y<scissor.y||scissor.x+scissor.z<area.x||scissor.y+scissor.w<area.y){discard;}\r\n#endif\r\n#ifdef USE_TEXTURE\r\nvec2 tex=mod(colorInfo,1.);vec4 mainColor=texture2D(texture,tex);\r\n#else\r\nvec4 mainColor=colorInfo;\r\n#endif\r\nmainColor*=mask;\r\n#ifdef USE_LIGHTING\r\nmainColor.xyz*=lightMask;\r\n#endif\r\n#ifdef USE_REFLECTION_CUBE\r\nmainColor=mainColor*(1.-reflectionIntensity)+textureCube(reflectionCube,reflect(normalize(mvPosition.xyz),lightNormal*vec3(-1,1,1)))*reflectionIntensity;\r\n#endif\r\nif(mainColor.w==0.0){discard;}else{\r\n#ifdef USE_FOG\r\nfloat fogLerp=clamp((length(mvPosition.xyz)-fog.x)/(fog.y-fog.x),0.,1.);mainColor.xyz=mainColor.xyz*(1.-fogLerp)+fogColor*fogLerp;\r\n#endif\r\ngl_FragColor=mainColor;}}");

Tessellator.MODEL_VERTEX_LIGHTING_SHADER = new Tessellator.ShaderPreset().configureActiveProgram(
    Tessellator.MODEL_VERTEX_LIGHTING_VERTEX_SHADER,
    Tessellator.MODEL_VERTEX_LIGHTING_FRAGMENT_SHADER
);

Tessellator.MODEL_NORMAL_VERTEX_SHADER = "attribute vec3 position;attribute vec3 normal;uniform mat4 mvMatrix;uniform mat4 pMatrix;uniform mat3 nMatrix;varying vec3 color;void main(void){gl_Position=pMatrix*mvMatrix*vec4(position,1);color=normal*nMatrix;}";
Tessellator.MODEL_NORMAL_FRAGMENT_SHADER = "precision mediump float;varying vec3 color;void main(void){gl_FragColor=vec4(color,1);}";

Tessellator.MODEL_NORMAL_SHADER = new Tessellator.ShaderPreset().configureStandardPair(
    Tessellator.MODEL_NORMAL_VERTEX_SHADER,
    Tessellator.MODEL_NORMAL_FRAGMENT_SHADER
);

Tessellator.DEPTH_MAP_VERTEX_PERSPECTIVE_SHADER = "attribute vec3 position;uniform mat4 mvMatrix;uniform mat4 pMatrix;varying vec4 vecp;void main(void){vecp=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*vecp;}";
Tessellator.DEPTH_MAP_FRAGMENT_PERSPECTIVE_SHADER = "precision highp float;varying vec4 vecp;uniform vec2 viewBounds;vec4 packFloat(float value){vec4 res=fract(value*vec4(256.0*256.0*256.0,256.0*256.0,256.0,1.0));res-=res.xxyz*vec4(0.0,vec3(1.0/256.0));return res;}void main(void){gl_FragColor=packFloat((length(vecp)-viewBounds.x)/(viewBounds.y-viewBounds.x));}";

Tessellator.DEPTH_MAP_PERSPECTIVE_SHADER = new Tessellator.ShaderPreset().configureStandardPair(
    Tessellator.DEPTH_MAP_VERTEX_PERSPECTIVE_SHADER,
    Tessellator.DEPTH_MAP_FRAGMENT_PERSPECTIVE_SHADER
);

Tessellator.DEPTH_MAP_VERTEX_ORTHOGRAPHIC_SHADER = "attribute vec3 position;uniform mat4 mvMatrix;uniform mat4 pMatrix;varying vec4 vecp;void main(void){vecp=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*vecp;}";
Tessellator.DEPTH_MAP_FRAGMENT_ORTHOGRAPHIC_SHADER = "precision highp float;varying vec4 vecp;uniform vec2 viewBounds;vec4 packFloat(float value){vec4 res=fract(value*vec4(256.0*256.0*256.0,256.0*256.0,256.0,1.0));res-=res.xxyz*vec4(0.0,vec3(1.0/256.0));return res;}void main(void){gl_FragColor=packFloat((vecp.z-viewBounds.x)/(viewBounds.y-viewBounds.x));}";

Tessellator.DEPTH_MAP_ORTHOGRAPHIC_SHADER = new Tessellator.ShaderPreset().configureStandardPair(
    Tessellator.DEPTH_MAP_VERTEX_ORTHOGRAPHIC_SHADER,
    Tessellator.DEPTH_MAP_FRAGMENT_ORTHOGRAPHIC_SHADER
);