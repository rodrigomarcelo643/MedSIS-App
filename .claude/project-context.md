# Claude Assistant Context for MedSIS-App

When generating code or proposing architectural changes for this directory, strictly adhere to the following project parameters:

### Core Tech Stack
- React Native (Expo SDK ~53)
- TypeScript (~5.8)
- NativeWind (Tailwind CSS for React Native)
- Expo Router (File-based navigation)

### The "MedSIS" Way
1. **Component Modularity**: Never dump 500 lines of code into a single file. Break down features into independent modules under the `/components/<FeatureName>/` folder. 
2. **Sharp UI Standard**: UI components must look uniform. Apply `rounded-sm` (2px border radius) to everything to maintain a professional, medical-grade structural feel. Avoid default mobile rounded corners.
3. **No Magic Strings**: Pull API URLs from `constants/Config.ts`.
4. **Safety First**: Your code must pass our custom `test-runner.js`. This requires strict null-checking (`?.`, `??`), no wild typescript typings (`: any`), and guaranteed `try/catch` wrappers around HTTP/Axios actions.
5. **Theme Awareness**: Use the exported `Colors.light` and `Colors.dark` palettes. Never hardcode hex values like `#FFFFFF` in TSX.

### Special System Flows
- **Push Notifications**: Expo token generation connects to `/api/save_push_token.php`. It utilizes Philippine Timezone formatting.
- **Image Blur ML**: The app validates academic and evaluation images locally using Laplacian Variance APIs before submission. Do not bypass this local check in your code suggestions.
