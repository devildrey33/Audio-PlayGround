

// Clamp number between two values with the following line:
Math.clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
} 

// Mix two values depending on the third normalized value
Math.mix = (x, y, a) => {
    return x * (1 - a) + y * a;
}

// Cubic bezier function from ChatGPT 
Math.cubicBezier = (A, B, C, D, t) => {
    const E = Math.mix(A, B, t);
    const F = Math.mix(B, C, t);
    const G = Math.mix(C, D, t);

    const H = Math.mix(E, F, t);
    const I = Math.mix(F, G, t);

    const P = Math.mix(H, I, t);

    return P;
}