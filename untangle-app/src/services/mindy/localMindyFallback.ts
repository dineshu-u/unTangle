import { MindyRequest, MindyResponse } from '../../domain/models/mindy';

export class LocalMindyFallback {
  public static getFallbackResponse(req: MindyRequest): MindyResponse {
    const isTa = req.language === 'ta';
    const isSuccess = req.outcome === 'success';

    switch (req.activityType) {
      case 'word_kite':
        if (isSuccess) {
          return {
            message: isTa
              ? `அற்புதம்! பட்டம் வானத்தில் எவ்வளவு உயரமாக அழகாக பறக்கிறது பார்!`
              : `Look at your kite soar high into the bright sky! That was a real word!`,
            emotion: 'celebrating',
            suggestedAction: 'continue',
          };
        } else {
          return {
            message: isTa
              ? `காற்றாடிக்கு தலை சுற்றுகிறது! எழுத்துக்களை மாற்றி வைத்து மீண்டும் முயற்சி செய்வோமா?`
              : `Whoops, the kite got dizzy! That was a made-up word. Let us try rearranging the tiles!`,
            emotion: 'encouraging',
            suggestedAction: 'retry',
          };
        }

      case 'teach_mindy':
        if (isSuccess) {
          return {
            message: isTa
              ? `நன்றி! நீங்கள் எனக்கு மிகச் சிறந்த பாடம் கற்றுக்கொடுத்தீர்கள்! என் சிறகுகள் மகிழ்ச்சியில் ஆடுகின்றன!`
              : `Thank you! You are such a caring teacher! My feather heart is dancing with joy!`,
            emotion: 'celebrating',
            suggestedAction: 'continue',
          };
        } else {
          return {
            message: isTa
              ? `ம்ம்ம்... மிண்டிக்கு இன்னும் கொஞ்சம் குழப்பமாக இருக்கிறது! மீண்டும் யோசித்து சொல்லுங்கள்!`
              : `Hmm... Mindy is still a little confused! Let us think carefully together!`,
            emotion: 'thinking',
            suggestedAction: 'retry',
          };
        }

      case 'letter_garden':
        return {
          message: isTa
            ? `தோட்டத்தில் உள்ள விலங்கு நண்பர்கள் உங்களோடு விளையாட தயாராக இருக்கிறார்கள்!`
            : `The friendly animal creatures in our garden love singing letter sounds with you!`,
          emotion: 'happy',
          suggestedAction: 'explore',
        };

      case 'pulse_path':
        return {
          message: isTa
            ? `மத்தளத்தின் தாளத்தை கவனித்து தட்டுங்கள்! த - திமி - தோம்!`
            : `Feel the joyful beat of the village drum! Tha - Dhin - Thom!`,
          emotion: 'excited',
          suggestedAction: 'practice',
        };

      case 'village_mela':
        return {
          message: isTa
            ? `கிராமத்து மேளாவில் வண்ண விளக்குகளும் இனிப்புகளும் காத்திருக்கின்றன! கொண்டாடுவோம்!`
            : `Welcome to the Village Mela! Festive lanterns are glowing for your 5-day journey!`,
          emotion: 'celebrating',
          suggestedAction: 'mela',
        };

      default:
        return {
          message: isTa
            ? `வணக்கம்! இன்று கிராமத்தில் என்ன விளையாட்டு விளையாடலாம்?`
            : `Hello friend! What adventure shall we explore in our village today?`,
          emotion: 'happy',
          suggestedAction: 'explore',
        };
    }
  }
}
