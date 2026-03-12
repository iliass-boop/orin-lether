const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');

try {
    console.log("Starting conversion...");
    execSync(`"${ffmpeg}" -y -i "C:\\Users\\CHAIB\\orin-leather\\public\\videos\\drifter_hero_animation.mov" -vcodec libx264 -acodec aac "C:\\Users\\CHAIB\\orin-leather\\public\\videos\\drifter_hero_animation.mp4"`, { stdio: 'inherit' });
    console.log("Conversion successful");
} catch (e) {
    console.error("Conversion failed", e);
}
