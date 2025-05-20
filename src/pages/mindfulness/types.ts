
export interface MindfulnessActivity {
  id: string;
  name: string;
  description: string;
  duration: string;
  type: 'meditación' | 'respiración' | 'relajación';
  instructions: string[];
}
