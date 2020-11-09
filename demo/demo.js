const app = new PIXI.Application({ backgroundColor: 0x1099bb, width: 500, height: 500 });
document.body.appendChild(app.view);

// Listen for animate update
app.ticker.add(() => {
    TWEEDLE.Group.shared.update();
});

const points = new PIXI.Container();
points.y = 500;
app.stage.addChild(points);
//

// create a new Sprite from an image path
const linear = new PIXI.Graphics()
linear.beginFill(0x0);
linear.drawCircle(0, 0, 5);
points.addChild(linear);

const quadRef = new PIXI.Graphics()
quadRef.beginFill(0xFF00FF);
quadRef.drawCircle(0, 0, 7);
points.addChild(quadRef);
const quad = new PIXI.Graphics()
quad.beginFill(0xFF0000);
quad.drawCircle(0, 0, 5);
points.addChild(quad);

const cubRef = new PIXI.Graphics()
cubRef.beginFill(0xFFFF00);
cubRef.drawCircle(0, 0, 7);
points.addChild(cubRef);
const cub = new PIXI.Graphics()
cub.beginFill(0x00FF00);
cub.drawCircle(0, 0, 5);
points.addChild(cub);

new TWEEDLE.Tween(linear.position).to({ x: [500], y: [-500] }, 10000).start().interpolation(TWEEDLE.Interpolation.Geom.Linear);
new TWEEDLE.Tween(quad.position).to({ x: [0, 500], y: [-500, -500] }, 10000).start().interpolation(TWEEDLE.Interpolation.Geom.QuadraticBezier);
new TWEEDLE.Tween(quadRef.position).to({ x: [0, 500], y: [-500, -500] }, 10000).start().interpolation(TWEEDLE.Interpolation.Geom.Bezier);
new TWEEDLE.Tween(cub.position).to({ x: [250, 250, 500], y: [0, -500, -500] }, 10000).start().interpolation(TWEEDLE.Interpolation.Geom.CubicBezier);
new TWEEDLE.Tween(cubRef.position).to({ x: [250, 250, 500], y: [0, -500, -500] }, 10000).start().interpolation(TWEEDLE.Interpolation.Geom.Bezier);

