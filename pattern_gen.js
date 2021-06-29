
/*
Copyright 2021 Jordan Miller

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var patternGen = {};

//generator variables and paramaters
patternGen.canvas = {};
patternGen.context = {};
patternGen.bacgroung_color = "white";
patternGen.foreground_color = "white";
patternGen.frequncy = 8;
patternGen.max_radus_scalor = 7;
patternGen.canvas_window_coverage = 1;
patternGen.break_animation = false;
patternGen.animation_expanding = true;
patternGen.current_radius_scalor = .8;


patternGen.tile_circle = function () {
    var h = patternGen.canvas.height;
    var w = patternGen.canvas.width;
    var r = Math.min(h, w) / (patternGen.frequncy * 2) ;

    for (let hrz = 0; hrz < (w/(2*r)); hrz++) {
        for (let vrt = 0; vrt < (h/(2*r)); vrt++) {
            //console.log(vrt);
            //console.log(hrz);
            patternGen.context.beginPath();
            patternGen.context.arc(r + r*2*hrz, r + r*2*vrt, r, 0, 2 * Math.PI);
            patternGen.context.stroke();
            patternGen.context.fillStyle = patternGen.foreground_color;
            patternGen.context.fill();
        }
    }
}

patternGen.tile_circle_packed = function (radius_scaler) {
  var h = patternGen.canvas.height;
  var w = patternGen.canvas.width;
  var r = Math.min(h, w) / (patternGen.frequncy * 2) ;
  var sqr_rt_three = 1.73205; //the ratio of the side of an equliateral triangle to its hieght, derived from pythogorium theorem.
    
  //first loop to fill backgrounds
  for (let hrz = -1; hrz <= (w/(2*r)); hrz++) {
      for (let vrt = -1; vrt < (h/(sqr_rt_three*r)); vrt++) {
          //rows are only sqr_rt_three * r apart due to horizontal shifting
          var hrz_offset = 0;
          if(vrt % 2 != 0) { hrz_offset = r;} //offset odd rows by radius

          patternGen.context.beginPath();
          patternGen.context.arc(r*2*hrz + hrz_offset, r + r*sqr_rt_three*vrt, r * radius_scaler, 0, 2 * Math.PI);
          patternGen.context.fillStyle = patternGen.foreground_color;
          patternGen.context.fill();
      }
  }
    //second loop to fill lines
    for (let hrz = -1; hrz <= (w/(2*r)); hrz++) {
        for (let vrt = -1; vrt < (h/(sqr_rt_three*r)); vrt++) {
            
            var hrz_offset = 0;
            if(vrt % 2 != 0) { hrz_offset = r;}

            patternGen.context.beginPath();
            
            patternGen.context.arc(r*2*hrz + hrz_offset, r + r*sqr_rt_three*vrt, r * radius_scaler, 0, 2 * Math.PI);
            //making one circle a red one so we can differentiate the aggregate from the individual
            if(vrt == 3 && hrz == 4) { patternGen.context.strokeStyle = "red"; }
            patternGen.context.stroke();
            if(vrt == 3 && hrz == 4) { patternGen.context.strokeStyle = "black"; }
        }
    }
  console.log("draw completed ".concat(patternGen.foreground_color));
}

patternGen.fill_bg = function () {
    if (!patternGen.context) {return};
    patternGen.context.fillStyle = patternGen.bacgroung_color;
    patternGen.context.fillRect(0, 0, patternGen.canvas.width, patternGen.canvas.height);
    console.log("bacground_drawn_".concat(patternGen.bacgroung_color));
}


patternGen.drawTiling = function (size_ratio){
  console.log(size_ratio);
  patternGen.fill_bg();
  patternGen.tile_circle_packed(size_ratio);
}

patternGen.sleep = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

patternGen.animate_tiling = async function (c_r_s_callback_input_element) {
    //end any prior animations
    patternGen.break_animation = true;
    await patternGen.sleep(200);
    patternGen.break_animation = false;
    
    while (true) {
        //grow from 0 to ratio
        if (patternGen.animation_expanding) {
          for (let i = patternGen.current_radius_scalor * 100; i < patternGen.max_radus_scalor * 100; i++) {
            await patternGen.sleep(120);
              patternGen.current_radius_scalor = i/100;
              patternGen.drawTiling(patternGen.current_radius_scalor);
              if(patternGen.break_animation){return};
              if(c_r_s_callback_input_element) {c_r_s_callback_input_element.value = patternGen.current_radius_scalor;}
          }
          patternGen.animation_expanding = false;
        }
        //shrink from ratio to 0
        if (!patternGen.animation_expanding){
            for (let i = patternGen.current_radius_scalor * 100; i > 0; i--) {
                await patternGen.sleep(120);
                patternGen.current_radius_scalor = i/100
                patternGen.drawTiling(patternGen.current_radius_scalor);
                if(patternGen.break_animation){return};
                if(c_r_s_callback_input_element) {c_r_s_callback_input_element.value = patternGen.current_radius_scalor;}
            }
            patternGen.animation_expanding = true;
        }
    }
}


patternGen.resizeCanvas = function () {
    patternGen.canvas.width = window.innerWidth;
    patternGen.canvas.height = window.innerHeight * patternGen.canvas_window_coverage;
    patternGen.drawTiling(patternGen.current_radius_scalor);
}
