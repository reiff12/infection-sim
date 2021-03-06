import { random } from "./utils";

import { SimNode } from './sim-node'

interface SimOptions {
  height: number;
  width: number;
  ballRadius?: number;
  nNodes?: number;
  ctx?: CanvasRenderingContext2D;
  recoveryTime?: number;
}

export class InfectionSim {
  private _nNodes: number;
  private _nodes: SimNode[];
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  recoveryTime: number;
  vaccine: boolean;

  constructor(options: SimOptions) {
    this._nNodes = options?.nNodes || 5;
    this._nodes = [];
    this.ctx = options?.ctx || null;
    this.height = options.height;
    this.width = options.width;
    this.recoveryTime = options?.recoveryTime || 15;
    this.vaccine = false;

    // build nodes
    this._makeNodes(this._nNodes);
  }
  get nNodes(): number {
    return this._nNodes;
  }
  set nNodes(n: number) {
    this._nNodes = n;
    this._makeNodes(this._nNodes);
  }
  get nodes(): SimNode[] {
    return this._nodes;
  }
  private _collisionDetection(node: SimNode) {
    this._nodes.forEach(otherNode => {
      if (
        node.x > otherNode.x &&
        node.x < otherNode.x + otherNode.radius &&
        node.y > otherNode.y &&
        node.y < otherNode.y + otherNode.radius
      ) {
        node.interact(otherNode);
      }
    });
  }
  private _makeNodes(n: number) {
    this._nodes = [];
    for (let i = 0; i < n; i++) {
      const node = new SimNode({
        x: random(this.width),
        y: random(this.height),
        dx: random(),
        dy: random()
      });
      this._nodes.push(node);
    }
    const sickNode = new SimNode({
      x: random(this.width),
      y: random(this.height),
      dx: random(),
      dy: random()
    });
    sickNode.infect();
    this._nodes.push(sickNode);
  }
  private _drawNode(node: SimNode) {
    let fillColor;
    switch (node.status) {
      case "healthy":
        fillColor = "#63b3ed";
        break;
      case "sick":
        fillColor = "#e53e3e";
        break;
      case "recovered":
        fillColor = "#5a67d8";
        break;
      case "vaccinated":
        fillColor = '#48BB78';
        break;
      default:
        fillColor = "grey";
    }
    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    this.ctx.closePath();
  }
  public step() {
    const now = Date.now();
    if (this.ctx !== null) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    this._nodes.forEach(node => {
      this._collisionDetection(node);
      if (node.status === "sick") {
        // recovery after 'recoveryTime seconads
        if (now - node.infectedAt > this.recoveryTime * 1000) {
          if (random() > 0.991) {
            node.die();
          } else {
            node.recover();
          }
        }
      }
      if (this.ctx) {
        this._drawNode(node);
      }
      if (
        node.x + node.dx > this.width - node.radius ||
        node.x + node.dx < node.radius
      ) {
        node.dx = -node.dx;
      }
      if (node.y + node.dy < node.radius) {
        node.dy = -node.dy;
      } else if (node.y + node.dy > this.height - node.radius) {
        node.dy = -node.dy;
      }
      node.x += node.dx;
      node.y += node.dy;
    });
  }
}
