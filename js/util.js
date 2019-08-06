/*jshint esversion: 6 */
export function randRange(min, max){
    return min + Math.random()*(max - min);
}
export const QUARTRAD = Math.PI/4;

export const ASTEROID_SIZE_NAME = {3: "bigAsteroids", 2:"asteroids", 1:"smallAsteroids"};