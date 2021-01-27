import * as THREE from 'three';

class RobotComponent{
  // op = origin point, ov = origin vector
  // jps = joint point at start, jvs = joint point at start, 
//op,ov,jps,jvs,jpc,jpc, jg
  constructor(state){
    /*
    this.originPoint = state.originPoint; // origin point THREE.Point3d
    this.originVector = state.originVector; // origin point THREE.Vector3d
    this.jointPointStart = state.jointPointStart; // joint point start THREE.Point3d
    this.jointVectorStart = state.jointVectorStart; // joint vector start THREE.Vector3d
    this.jointPointEnd = state.jointPointEnd; // joint point start THREE.Point3d
    this.jointVectorEnd = state.jointVectorEnd; // joint vector start THREE.Vector3d
    this.jointGroup = state.jointGroup; // THREE.jointGroup
    this.mesh = state.mesh; // THREE.Mesh
    this.rotate = state.rotate; // 
    */
    this.state = state;
    this.state.mesh = this.buildComponent();
  }
  buildComponent(){
    var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    var mesh = new THREE.Mesh( geometry, material );
    return mesh;
  }
  get state(){
    return this.state;
  }

}
export default RobotComponent => {
  const state={
    originPoint: new THREE.Vector3(0,0,0),
    originVector: new THREE.Vector3(0,1,0),
    jointPointStart: new THREE.Vector3(0,0,0),
    jointVectorStart: new THREE.Vector3(0,1,0),
    jointPointEnd: new THREE.Vector3(0,1,1),
    jointVectorEnd: new THREE.Vector3(0,1,0),
    jointGroup: new THREE.Group(),
    mesh: new THREE.Mesh()
  };
  const model = new RobotComponent(state);
  return model;
}
// todo -> get rid of scene injection using require scene -> threerobot handles 3d view
