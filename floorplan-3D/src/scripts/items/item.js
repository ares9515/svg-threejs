import { EventDispatcher, Vector3, Vector2 } from 'three';
import { Quaternion, Euler } from 'three';
import { EVENT_UPDATED, EVENT_PARAMETRIC_GEOMETRY_UPATED, EVENT_MOVED, EVENT_DELETED } from '../core/events';
import { Utils } from '../core/utils';
import { BASE_PARAMETRIC_TYPES, ParametricFactory } from '../parametrics/ParametricFactory';
export const UP_VECTOR = new Vector3(0, 1, 0);
/**
 * An Item is an abstract entity for all things placed in the scene, e.g. at
 * walls or on the floor.
 */
export class Item extends EventDispatcher {
    /**
     * Constructs an item. This is a pure data representation of a room item.
     * Because floorplanner is pure MVC or MVP it is the responsibility of the respective viewer
     * to create the physical entity based on the item data
     *
     * @param model
     *            TODO
     * @param metadata
     *            TODO
     * @param id
     *            TODO
     */
    constructor(metadata, model, id) {
        super();

        /**
         * @property {String} id The id of this corner. Autogenerated the first time
         * @type {String}
         **/
        this.__id = id || Utils.guide();
        this.__metadata = metadata;
        this.__model = model;
        this.__position2d = new Vector2();
        this.__position = new Vector3();
        this.__rotation = new Vector3();
        this.__innerRotation = new Vector3();

        /**
         * The below property should be used when setting the rotation of a physicalitem
         * Also this property is only for rendering the scene and will not be a part of the metadata
         */
        this.__combinedRotation = new Vector3();

        this.__scale = new Vector3(1, 1, 1);

        this.__size = new Vector3(1, 1, 1);
        this.__mesh = [];
        this.__meshmap = [];
        this.__halfSize = new Vector3(1, 1, 1);

        this.__customIntersectionPlanes = [];
        this.__customIntersectionPlanes1=[];

        /** */
        this.__hover = false; //This is part of application logic only
        /** */
        this.__selected = false; //This is part of application logic only
        this.__freePosition = true; //This is part of application logic only
        this.__boundToFloor = false; //This is part of application logic only
        this.__allowRotate = true; //This is part of application logic only

        this.__fixed = false; //This is part of application logic and also Metadata
        this.__resizable = false; //This is part of application logic and also Metadata

        this.__frontVisible = false;
        this.__backVisible = false;
        this.__visible = true;
        this.__offlineUpdate = true;

        this.__isParametric = false;
        this.__baseParametricType = null;
        this.__subParametricType = 1;
        this.__parametricClass = null;

        this.__currentWall = null;
        this.__currentFloor = null;
        this.__currentWallNormal = null;
        this.__currentWallSnapPoint = null;
        this.__isWallDependent = false;

        this.__followWallEvent = this.__followWall.bind(this);
        this.__edgeDeletedEvent = this.__edgeDeleted.bind(this);
        this.__parametricGeometryUpdateEvent = this.__parametricGeometryUpdate.bind(this);
        /** Show rotate option in context menu */
        this.allowRotate = true;

        this.castShadow = true;
        this.receiveShadow = true;
        this.__initializeMetaData();
    }

    __initializeMetaData() {
        this.__fixed = (this.__metadata.fixed) ? this.__metadata.fixed : true;
        this.__resizable = (this.__metadata.resizable) ? this.__metadata.resizable : true;
        this.__mesh = (this.__metadata.mesh) ? this.__metadata.mesh : [];
        this.__meshmap = (this.__metadata.meshmap) ? this.__metadata.meshmap : [];
        
        if (this.__metadata.position && this.__metadata.position.length) {
            this.__position = new Vector3().fromArray(this.__metadata.position).clone();
        }
       
            if (this.__metadata.innerRotation && this.__metadata.innerRotation.length) {
                this.__innerRotation = new Vector3().fromArray(this.__metadata.innerRotation).clone();
            } else {
                this.__innerRotation = new Vector3();
            }
        

        if (this.__metadata.scale.length) {
            this.__scale = new Vector3().fromArray(this.__metadata.scale).clone();
        }
        if (this.__metadata.size.length) {
            this.__size = new Vector3().fromArray(this.__metadata.size).clone();
            this.__halfSize = this.__size.clone().multiplyScalar(0.5);
        }
     
        if (this.__metadata.isParametric) {
            this.__isParametric = this.__metadata.isParametric;
            switch (this.__metadata.baseParametricType) {
                case BASE_PARAMETRIC_TYPES.DOOR.description:
                    this.__baseParametricType = BASE_PARAMETRIC_TYPES.DOOR;
                    break;
                case BASE_PARAMETRIC_TYPES.WINDOW.description:
                    this.__baseParametricType = BASE_PARAMETRIC_TYPES.WINDOW;
                    break;
                case BASE_PARAMETRIC_TYPES.CABINET.description:
                    this.__baseParametricType = BASE_PARAMETRIC_TYPES.CABINET;
                    break;
                case BASE_PARAMETRIC_TYPES.SHELVES.description:
                    this.__baseParametricType = BASE_PARAMETRIC_TYPES.SHELVES;
                    break;
                case BASE_PARAMETRIC_TYPES.LIGHTS.description:
                    this.__baseParametricType = BASE_PARAMETRIC_TYPES.LIGHTS;
                    break;
            }
            this.__subParametricData = this.__metadata.subParametricData;
            let parametricClass = ParametricFactory.getParametricClass(this.__baseParametricType.description);
            this.__parametricClass = new (parametricClass.getClass(this.__subParametricData.type))(this.__subParametricData);
            this.__parametricClass.addEventListener(EVENT_PARAMETRIC_GEOMETRY_UPATED, this.__parametricGeometryUpdateEvent);

        } else {
            this.__isParametric = false;
        }

        if (this.__metadata.wall) {
            let walls = this.__model.floorplan.walls;
            for (let i = 0; i < walls.length; i++) {
                let wall = walls[i];
                if (wall.id === this.__metadata.wall) {
                    let wallEdge = (this.__metadata.wallSide === 'front') ? wall.frontEdge : wall.backEdge;
                    let wallSurfacePoint = this.__metadata.wallSurfacePoint;
                    this.__currentWallSnapPoint = new Vector3(wallSurfacePoint[0], wallSurfacePoint[1], wallSurfacePoint[2]);
                    this.snapToWall(this.__currentWallSnapPoint, wall, wallEdge);
                    break;
                }
            }
        }
    }

    __parametricGeometryUpdate(evt, updateForWall = true) {
        let box = this.__parametricClass.geometry.boundingBox;
        this.__size = box.getSize(new Vector3());
        this.__halfSize = this.__size.clone().multiplyScalar(0.5);
        if (this.__currentWall && updateForWall) {
            let point = Utils.cartesianFromBarycenter(this.__currentWallEdge.vertices, this.__barycentricLocation);
            this.snapToWall(point, this.__currentWall, this.__currentWallEdge);
            // this.position = this.__position;
            // this.__currentWall.addItem(this);
        }
    }

    __edgeDeleted(evt) {
        if (this.__currentWall) {
            let wallEdge = (this.__metadata.wallSide === 'front') ? this.__currentWall.frontEdge : this.__currentWall.backEdge;
            this.__currentWallEdge = null;
            let point = Utils.cartesianFromBarycenter(wallEdge.vertices, this.__barycentricLocation);
            this.snapToWall(point, this.__currentWall, wallEdge);
        }
    }

    __followWall(evt) {
        if (this.__isWallDependent && this.__currentWall && !this.__offlineUpdate) {
            
            let point = Utils.cartesianFromBarycenter(this.__currentWallEdge.vertices, this.__barycentricLocation);
            this.snapToWall(point, this.__currentWall, this.__currentWallEdge);
        }
    }

    __addToAWall(toWall, toWallEdge) {
        if (toWall === undefined || !toWall || toWall === 'undefined') {
            return;
        }
        if (this.__currentWall && this.__currentWall !== toWall) {
            this.__currentWall.removeEventListener(EVENT_MOVED, this.__followWallEvent);
            this.__currentWallEdge.removeEventListener(EVENT_DELETED, this.__edgeDeletedEvent);
            this.__currentWall.removeItem(this);
        }

        

        let barycentricUVW = Utils.barycentricFromCartesian(toWallEdge.vertices, this.__currentWallSnapPoint);
        this.__currentWall = toWall;
        this.__currentWallEdge = toWallEdge;
        this.__barycentricLocation = barycentricUVW.clone();

        this.__metadata.wall = this.__currentWall.id;
        this.__metadata.wallSide = (toWallEdge.front) ? 'front' : 'back';
        this.__metadata.wallSurfacePoint = [this.__currentWallSnapPoint.x, this.__currentWallSnapPoint.y, this.__currentWallSnapPoint.z];
        this.__offlineUpdate = true; //Really important as it will lead to a lot of recursion
        this.__currentWall.addItem(this); //This causes wall to dispatch event_moved triggering followWall, which will trigger this method again
        this.__offlineUpdate = false; //Really important as it will lead to a lot of recursion
        if (!this.__currentWall.hasEventListener(EVENT_MOVED, this.__followWallEvent)) {
            this.__currentWall.addEventListener(EVENT_MOVED, this.__followWallEvent);
            this.__currentWallEdge.addEventListener(EVENT_DELETED, this.__edgeDeletedEvent);
        }
        this.combinedRotation = this.__combineRotations();
    }

    /** */
    __moveToPosition() { }

    __getMetaData() {
        return {
            id: this.id,
            itemName: this.metadata.itemName,
            itemType: this.metadata.itemType,
            modelURL: this.metadata.modelUrl,
            position: this.position.toArray(),
            rotation: this.rotation.toArray(),
            innerRotation: this.innerRotation.toArray(),
            scale: this.scale.toArray(),
            size: this.size.toArray(),
            fixed: this.__fixed,
            resizable: this.__resizable,
            mesh: this.mesh,
            meshmap: this.meshmap
        };
    }

    __metaDataUpdate(propertyname) {
        this.dispatchEvent({ type: EVENT_UPDATED, property: propertyname });
    }

    __combineRotations() {
        let quatEuler = new Quaternion().setFromEuler(new Euler(this.innerRotation.x, this.innerRotation.y, this.innerRotation.z));
        let quatRotation = new Quaternion().setFromEuler(new Euler(this.rotation.x, this.rotation.y, this.rotation.z));
        let combinedRotation = quatEuler.multiply(quatRotation);
        let finalEuler = new Euler().setFromQuaternion(combinedRotation);
        return new Vector3(finalEuler.x, finalEuler.y, finalEuler.z);
    }

    updateMetadataExplicit() {
        this.__metadata = this.__getMetaData();
    }

    snapToPoint(point, normal, intersectingPlane, toWall, toFloor, toRoof) {
        this.position = point;
    }

    snapToWall(point, wall, wallEdge) { }

   

    newWallEdge() {
        let wallEdge = (this.__metadata.wallSide === 'front') ? this.__currentWall.frontEdge : this.__currentWall.backEdge;
        this.__currentWallEdge = null;
        this.__currentWallEdge = wallEdge;
    }

    dispose() {
        if (this.isParametric && this.__parametricClass) {
            this.__parametricClass.removeEventListener(EVENT_PARAMETRIC_GEOMETRY_UPATED, this.__parametricGeometryUpdateEvent);
        }
        if (this.__currentWall) {
            this.__currentWall.removeEventListener(EVENT_MOVED, this.__followWallEvent);
            this.__currentWall.removeItem(this);
        }
        if (this.__currentWallEdge) {
            this.__currentWallEdge.removeEventListener(EVENT_DELETED, this.__edgeDeletedEvent);
        }

    }


    get id() {
        return this.__id;
    }

    get metadata() {
        if (this.isParametric) {
            this.__metadata.subParametricData = this.__parametricClass.metadata;
        }
        return this.__metadata;
    }

    set metadata(mdata) {
        this.__metadata = mdata;
        this.__applyMetaData();
    }

    get position2d() {
        return this.__position2d;
    }

    get position() {
        return this.__position;
    }
    set position(p) {
        this.__position2d.x = p.x;
        this.__position2d.y = p.z;
        this.__position.copy(p);
        this.__metadata.position = this.__position.toArray();
        this.__moveToPosition();
        this.__metaDataUpdate('position');
    }

    get rotation() {
        return this.__rotation;
    }

    set rotation(r) {
        let old = this.__rotation.clone();
        let current = r.clone();
        if (old.sub(current).length() < 1e-4) {
            return;
        }
        this.__rotation.copy(r);
        this.__metadata.rotation = this.__rotation.toArray();
        this.__metaDataUpdate('innerRotation');
        if(this.__metadata.itemType==1){
            this.combinedRotation = this.__combineRotations();
        }
        
    }

    get innerRotation() {
        return this.__innerRotation;
    }

    set innerRotation(eulerRotation) {
        this.__innerRotation = eulerRotation.clone();
        this.__metadata.innerRotation = this.__innerRotation.toArray();
        this.__metaDataUpdate('innerRotation');
        this.combinedRotation = this.__combineRotations();
    }

    get combinedRotation() {
        return this.__combinedRotation;
    }

    set combinedRotation(rotation) {
        this.__combinedRotation = rotation;
        this.__metaDataUpdate('innerRotation');
        //this.__metaDataUpdate('combinedRotation');
    }

    get scale() {
        return this.__scale;
    }

    set scale(s) {
        this.__scale.copy(s);
        this.__metadata.scale = this.__scale.toArray();
        this.__metaDataUpdate('scale');
    }
    /**
     * This is a read-only property. This can be changed only internally with private and protected acces
     */

     get mesh() {
        return this.__mesh;
    }

    set mesh(value) {
        this.__mesh.copy(value);
        this.__metadata.mesh = this.__mesh;
        this.__metaDataUpdate('mesh');
    }

    get meshmap() {
        return this.__meshmap;
    }

    set meshmap(value) {
        this.__meshmap = value;
        this.__metadata.meshmap = this.__meshmap;
        this.__metaDataUpdate('meshmap');
    }
    
    get size() {
        return this.__size.clone();
    }

    set size(value) {
        this.__size = value;
        this.__metaDataUpdate('size');
    }

    get model(){
        return this.__model;
    }

    get modelURL() {
        return this.__metadata.modelURL;
    }

    set modelURL(value) {
        this.__metadata.modelURL = value;
        this.__metaDataUpdate('modelURL');
    }

    get fixed() {
        return this.__fixed;
    }

    set fixed(flag) {
        this.__fixed = flag;
        this.__metaDataUpdate('fixed');
    }

    get frontVisible() {
        return this.__frontVisible;
    }

    set frontVisible(flag) {
        this.__frontVisible = flag;
    }

    get backVisible() {
        return this.__backVisible;
    }

    set backVisible(flag) {
        this.__backVisible = flag;
    }

    get visible() {
        return this.__visible;
    }

    set visible(flag) {
        this.__visible = flag;
        // this.frontVisible = false;
        // this.backVisible = false;
        this.__metaDataUpdate('visible');
    }

    get isParametric() {
        return this.__isParametric;
    }

    get baseParametricType() {
        return this.__baseParametricType;
    }

    get subParametricData() {
        return this.__subParametricData;
    }

    get parametricClass() {
        return this.__parametricClass;
    }

    get resizable() {
        return this.__resizable;
    }

    get itemName() {
        return this.__metadata.itemName;
    }

    get itemType() {
        return this.__metadata.itemType;
    }

    set itemType(type) {
        this.__metadata.itemType=type;
        this.__metaDataUpdate('position');
    }

    get halfSize() {
        return this.__halfSize.clone();
    }

    get intersectionPlanes() {
        return this.__customIntersectionPlanes;
    }

    get intersectionPlanes_wall() {
        return this.__customIntersectionPlanes1;
    }

    get isWallDependent() {
        return this.__isWallDependent;
    }

    get offlineUpdate() {
        return this.__offlineUpdate;
    }

    get wallSide() {
        return this.__metadata.wallSide;
    }
}