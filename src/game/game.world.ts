import * as Matter from 'matter-js'
import { GameSchema, PlatformType } from './game.state'

const platformCategory = 1
const playerCategory = 2

export interface useGameWorld {
  engine: Matter.Engine
  runner: Matter.Runner
  removeBody: (body: Matter.Body) => void
  addPlayer: (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => Matter.Body
  addPlatform: (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => Matter.Body
  ground: Matter.Body
  destory: () => void
}

export function useGameWorld(schema: GameSchema) {
  const engine = Matter.Engine.create()

  const addPlayer = (
    x: number,
    y: number,
    width: number,
    height: number,
  ): Matter.Body => {
    const body = Matter.Bodies.rectangle(x, y, width, height, {
      friction: 0,
      inertia: Infinity,
      collisionFilter: {
        category: playerCategory,
        mask: 1,
      },
    })
    Matter.Composite.add(engine.world, body)
    return body
  }

  const addPlatform = (
    x: number,
    y: number,
    width: number,
    height: number,
  ): Matter.Body => {
    const body = Matter.Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      collisionFilter: {
        category: platformCategory,
      },
    })
    Matter.Composite.add(engine.world, body)
    return body
  }

  const createGround = (): Matter.Body => {
    const x = 0
    const y = 5
    const width = 200
    const height = 10
    const body = Matter.Bodies.rectangle(x, y, width, height, {
      isStatic: true,
    })
    schema.ground.position.assign({
      x: x,
      y: y,
    })
    schema.ground.size.assign({
      width: width,
      height: height,
    })
    Matter.Composite.add(engine.world, body)
    return body
  }

  const removeBody = (body: Matter.Body) => {
    Matter.Composite.remove(engine.world, body)
  }

  const ground = createGround()
  Matter.Composite.add(engine.world, ground)

  const runner = Matter.Runner.create({
    isFixed: true,
  })

  // run the engine
  Matter.Runner.run(runner, engine)

  Matter.Events.on(runner, 'beforeTick', (e) => {
    schema.players.forEach((player) => {
      // handle player collision if goes up he should go through platforms. if he falls he should collide with plattforms
      if (player.body.velocity.y < 0) {
        player.body.collisionFilter.mask = 0
      } else {
        player.body.collisionFilter.mask = 1
      }
    })
  })

  Matter.Events.on(runner, 'beforeUpdate', (e) => {
    const platforms: Matter.Body[] = Array.from(schema.platforms.values()).map(
      (value) => value.body,
    )
    const floors: Matter.Body[] = [ground, ...platforms]
    schema.players.forEach((player) => {
      const playerBody = player.body
      // player input handling
      if (player.input.horizontal < 0) {
        Matter.Body.setVelocity(playerBody, {
          x: -player.moveSpeed,
          y: playerBody.velocity.y,
        })
      }
      if (player.input.horizontal > 0) {
        Matter.Body.setVelocity(playerBody, {
          x: player.moveSpeed,
          y: playerBody.velocity.y,
        })
      }

      // handle player friction if he falls he should have no friction so he dosnt stick on a wall
      playerBody.friction = 0
      for (let floor of floors) {
        const doesCollide = Matter.SAT.collides(floor, playerBody)
        // TODO only add friction if play stand on top of a floor
        if (
          doesCollide?.collided /* && floor.position.y - 2.5 > player.position.y + 4.9 */
        ) {
          player.extraJumpsUsed = 0
          //playersInput[index].usedDoubleJump = false
          playerBody.friction = 0.9
          break
        }
      }
    })

    schema.platforms.forEach((platform) => {
      const isMovingPlatform = platform.type == PlatformType.MOVING
      if (isMovingPlatform) {
        const platformBody = platform.body
        var px = Math.sin(engine.timing.timestamp * 0.003) * 1.1
        Matter.Body.setVelocity(platformBody, {
          x: px,
          y: platformBody.velocity.y,
        })
        Matter.Body.setPosition(platformBody, {
          x: platformBody.position.x + px,
          y: platformBody.position.y,
        })
      }
      const isFallingPlatform = platform.type == PlatformType.FALLING
      if (isFallingPlatform) {
        const platformBody = platform.body

        var py = Math.sin(engine.timing.timestamp * 0.003) * 0.3
        Matter.Body.setVelocity(platformBody, {
          x: platformBody.velocity.x,
          y: py,
        })
        Matter.Body.setPosition(platformBody, {
          x: platformBody.position.x,
          y: platformBody.position.y + py,
        })
      }
    })

    // reset players if they get out of bounds
    const boundDistance = schema.ground.size.width / 2 - 5
    schema.players.forEach((player) => {
      const playerX = player.body.position.x
      const isPlayerToFarLeft = playerX < -boundDistance
      if (isPlayerToFarLeft) {
        Matter.Body.setPosition(player.body, {
          x: -boundDistance,
          y: player.body.position.y,
        })
        return
      }
      const isPlayerToFarRight = playerX > boundDistance
      if (isPlayerToFarRight) {
        Matter.Body.setPosition(player.body, {
          x: boundDistance,
          y: player.body.position.y,
        })
        return
      }
    })
  })

  const destory = () => {
    Matter.World.clear(engine.world, false)
    Matter.Engine.clear(engine)
    Matter.Runner.stop(runner)
  }

  return {
    engine,
    runner,
    removeBody,
    addPlayer,
    addPlatform,
    ground,
    destory,
  }
}
