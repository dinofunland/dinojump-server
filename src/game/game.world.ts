import * as Matter from 'matter-js'
import { GameSchema, PlatformType } from './game.state';

const platformCategory = 1
const playerCategory = 2

export interface useGameWorld {
    engine: Matter.Engine
    runner: Matter.Runner
    removeBody: (body: Matter.Body) => void
    addPlayer: (x: number, y: number, width: number, height: number) => Matter.Body
    addPlatform: (x: number, y: number, width: number, height: number) => Matter.Body
    ground: Matter.Body
}

export function useGameWorld(schema: GameSchema) {
    const engine = Matter.Engine.create();

    const addPlayer = (x: number, y: number, width: number, height: number): Matter.Body => {
        const body = Matter.Bodies.rectangle(x, y, width, height, {
            friction: 0,
            inertia: Infinity,
            collisionFilter: {
                category: playerCategory,
                mask: 1
            }
        });
        Matter.Composite.add(engine.world, body)
        return body;
    }

    const addPlatform = (x: number, y: number, width: number, height: number): Matter.Body => {
        const body = Matter.Bodies.rectangle(x, y, width, height, {
            isStatic: true,
            collisionFilter: {
                category: platformCategory
            }
        })
        Matter.Composite.add(engine.world, body)
        return body
    }

    const createGround = (): Matter.Body => {
        const body = Matter.Bodies.rectangle(0, 5, 1000, 10, { isStatic: true });
        Matter.Composite.add(engine.world, body)
        return body
    }

    const removeBody = (body: Matter.Body) => {
        Matter.Composite.remove(engine.world, body)
    }

    const ground = createGround()
    Matter.Composite.add(engine.world, ground)

    const runner = Matter.Runner.create();

    // run the engine
    Matter.Runner.run(runner, engine);

    Matter.Events.on(runner, 'beforeTick', (e) => {
        schema.players.forEach(player => {
            // handle player collision if goes up he should go through platforms. if he falls he should collide with plattforms 
            if (player.body.velocity.y < 0) {
                player.body.collisionFilter.mask = 0
            } else {
                player.body.collisionFilter.mask = 1
            }
        })
    })

    Matter.Events.on(runner, 'afterTick', (e) => {
        const platforms: Matter.Body[] = Array.from(schema.platforms.values()).map(value => value.body)
        const floors: Matter.Body[] = [ground, ...platforms]
        const power = 2;
        schema.players.forEach(player => {
            const playerBody = player.body

            // player input handling

            if (player.input.left) {
                Matter.Body.setVelocity(playerBody, {
                    x: -power,
                    y: playerBody.velocity.y
                })
            }
            if (player.input.right) {
                Matter.Body.setVelocity(playerBody, {
                    x: power,
                    y: playerBody.velocity.y
                })
            }

            // handle player friction if he falls he should have no friction so he dosnt stick on a wall
            playerBody.friction = 0
            for (let floor of floors) {
                const doesCollide = Matter.SAT.collides(floor, playerBody)
                if (doesCollide && ((floor.position.y - 2.5) > (player.position.y + 4.9))) {
                    //playersInput[index].usedDoubleJump = false
                    playerBody.friction = 0.9
                    break;
                }
            }
        })

        schema.platforms.forEach(platform => {
            const isMovingPlatform = platform.type == PlatformType.MOVING
            if (isMovingPlatform) {
                const platformBody = platform.body
                var px = Math.sin(engine.timing.timestamp * 0.003) * 2;
                Matter.Body.setVelocity(platformBody, { x: px, y: platformBody.velocity.y });
                Matter.Body.setPosition(platformBody, { x: platformBody.position.x + px, y: platformBody.position.y });
            }
        })
    })

    return {
        engine,
        runner,
        removeBody,
        addPlayer,
        addPlatform,
        ground
    }

}